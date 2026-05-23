const countdownEl = document.getElementById('countdown');

function tickCountdown() {
  if (!countdownEl) return;

  const now = new Date();
  const target = new Date(now);
  target.setHours(18, 1, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target - now;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  countdownEl.textContent =
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0');
}

tickCountdown();
setInterval(tickCountdown, 1000);
