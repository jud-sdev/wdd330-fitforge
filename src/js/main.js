// Dashboard — Stats & Recent Workouts

const totalWorkoutsEl = document.getElementById('total-workouts');
const thisWeekEl = document.getElementById('this-week');
const currentStreakEl = document.getElementById('current-streak');
const totalVolumeEl = document.getElementById('total-volume');
const recentLogEl = document.getElementById('recent-log');
const noLogsMsg = document.getElementById('no-logs-msg');

function getWorkoutLogs() {
  return JSON.parse(localStorage.getItem('ff-workout-logs') || '[]');
}

function calcStats(logs) {
  const total = logs.length;

  // This week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const thisWeek = logs.filter((l) => new Date(l.date) >= startOfWeek).length;

  // Day streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = [...new Set(logs.map((l) => {
    const d = new Date(l.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => b - a);

  if (uniqueDays.length > 0) {
    const oneDay = 86400000;
    let checkDate = today.getTime();

    // Allow today or yesterday as starting point
    if (uniqueDays[0] === checkDate || uniqueDays[0] === checkDate - oneDay) {
      checkDate = uniqueDays[0];
      for (const day of uniqueDays) {
        if (day === checkDate) {
          streak++;
          checkDate -= oneDay;
        } else if (day < checkDate) {
          break;
        }
      }
    }
  }

  // Total volume (sets × reps × weight)
  let volume = 0;
  logs.forEach((log) => {
    log.exercises.forEach((ex) => {
      volume += (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
    });
  });

  return { total, thisWeek, streak, volume };
}

function renderRecentLogs(logs) {
  const recent = logs.slice(-5).reverse();

  if (recent.length === 0) {
    noLogsMsg.style.display = 'block';
    recentLogEl.innerHTML = '';
    return;
  }

  noLogsMsg.style.display = 'none';
  recentLogEl.innerHTML = recent.map((log) => {
    const date = new Date(log.date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
    const exerciseNames = log.exercises.map((e) => e.name).join(', ');
    return `
      <li class="workout-log-item">
        <div class="log-header">
          <span class="log-name">${log.routineName}</span>
          <span class="log-date">${date}</span>
        </div>
        <p class="log-exercises">${exerciseNames}</p>
        <p class="log-summary">${log.exercises.length} exercises &middot; ${log.exercises.reduce((sum, e) => sum + (e.sets || 0), 0)} total sets</p>
      </li>
    `;
  }).join('');
}

function init() {
  const logs = getWorkoutLogs();
  const stats = calcStats(logs);

  totalWorkoutsEl.textContent = stats.total;
  thisWeekEl.textContent = stats.thisWeek;
  currentStreakEl.textContent = stats.streak;
  totalVolumeEl.textContent = stats.volume.toLocaleString();

  renderRecentLogs(logs);
}

init();
