const countdownEl = document.getElementById('countdown');
const nextPrayerPill = document.querySelector('.hero__meta .pill--soft');

const TIME_ZONE = 'Asia/Jakarta';

// Jakarta Timur reference used here
const PRAYER_TIMES = [
  { name: 'Fajr', time: '04:48' },
  { name: 'Dhuhr', time: '12:01' },
  { name: 'Asr', time: '15:11' },
  { name: 'Maghrib', time: '18:04' },
  { name: 'Isha', time: '19:13' }
];

function getPartsInTimeZone(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

  const parts = formatter.formatToParts(date);
  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second)
  };
}

// Creates a comparable "Jakarta-local" Date value
function makeJakartaDate({ year, month, day, hour, minute, second = 0 }) {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function formatDiff(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0')
  );
}

function tickCountdown() {
  if (!countdownEl) return;

  const nowParts = getPartsInTimeZone(new Date(), TIME_ZONE);
  const nowJakarta = makeJakartaDate(nowParts);

  let nextPrayer = null;
  let nextPrayerDate = null;

  for (const prayer of PRAYER_TIMES) {
    const [hour, minute] = prayer.time.split(':').map(Number);
    const prayerDate = makeJakartaDate({
      year: nowParts.year,
      month: nowParts.month,
      day: nowParts.day,
      hour,
      minute,
      second: 0
    });

    if (prayerDate > nowJakarta) {
      nextPrayer = prayer;
      nextPrayerDate = prayerDate;
      break;
    }
  }

  if (!nextPrayer) {
    const [hour, minute] = PRAYER_TIMES[0].time.split(':').map(Number);
    nextPrayer = PRAYER_TIMES[0];
    nextPrayerDate = makeJakartaDate({
      year: nowParts.year,
      month: nowParts.month,
      day: nowParts.day + 1,
      hour,
      minute,
      second: 0
    });
  }

  countdownEl.textContent = formatDiff(nextPrayerDate - nowJakarta);

  if (nextPrayerPill) {
    nextPrayerPill.textContent = nextPrayer.name;
  }
}

tickCountdown();
setInterval(tickCountdown, 1000);