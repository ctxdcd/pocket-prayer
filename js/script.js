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




/* =========================================
   DAILY SALAH TRACKER
========================================= */

const salahTrackerPrayers = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha"
];

const STORAGE_KEY = "pocketPrayerTrackerData";

const trackerDateEl = document.getElementById("trackerDate");
const trackerListEl = document.getElementById("trackerList");
const trackerPercentEl = document.getElementById("trackerPercent");
const trackerMetaEl = document.getElementById("trackerMeta");
const progressFillEl = document.getElementById("progressFill");

const prevDayBtn = document.getElementById("prevDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");

const today = new Date();
const maxDate = new Date("2027-12-31");

let selectedDate = new Date();

function formatDateKey(date) {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function getTrackerData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}

function saveTrackerData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDayData(dateKey) {
  const data = getTrackerData();

  if (!data[dateKey]) {
    data[dateKey] = {};
  }

  return data[dateKey];
}

function togglePrayer(prayerName) {
  const dateKey = formatDateKey(selectedDate);
  const data = getTrackerData();

  if (!data[dateKey]) {
    data[dateKey] = {};
  }

  data[dateKey][prayerName] = !data[dateKey][prayerName];

  saveTrackerData(data);

  renderTracker();
}

function renderTracker() {
  const dateKey = formatDateKey(selectedDate);

  trackerDateEl.textContent = formatDisplayDate(selectedDate);

  trackerListEl.innerHTML = "";

  const dayData = getDayData(dateKey);

  let completed = 0;

  salahTrackerPrayers.forEach((prayer) => {
    const checked = !!dayData[prayer];

    if (checked) completed++;

    const item = document.createElement("label");
    item.className = `tracker-item ${checked ? "is-done" : ""}`;

    item.innerHTML = `
      <input 
        type="checkbox"
        class="tracker-checkbox"
        ${checked ? "checked" : ""}
      />

      <div class="tracker-item__check"></div>

      <div class="tracker-item__label">
        ${prayer}
      </div>

      <div class="tracker-item__status">
        ${checked ? "Completed" : "Not completed"}
      </div>
    `;

    item.addEventListener("click", () => {
      togglePrayer(prayer);
    });

    trackerListEl.appendChild(item);
  });

  const percent = Math.round((completed / salahTrackerPrayers.length) * 100);

  trackerPercentEl.textContent = `${percent}%`;

  trackerMetaEl.textContent =
    `${completed} of ${salahTrackerPrayers.length} prayers completed`;

  progressFillEl.style.width = `${percent}%`;

  updateNavButtons();
}

function updateNavButtons() {
  const todayKey = formatDateKey(today);
  const selectedKey = formatDateKey(selectedDate);
  const maxKey = formatDateKey(maxDate);

  prevDayBtn.disabled = false;

  nextDayBtn.disabled =
    selectedKey >= todayKey || selectedKey >= maxKey;
}

function changeDay(amount) {
  const newDate = new Date(selectedDate);

  newDate.setDate(newDate.getDate() + amount);

  if (newDate > today) return;
  if (newDate > maxDate) return;

  selectedDate = newDate;

  renderTracker();
}

prevDayBtn?.addEventListener("click", () => {
  changeDay(-1);
});

nextDayBtn?.addEventListener("click", () => {
  changeDay(1);
});

renderTracker();