// ===== STATE =====
let tripActive = false;
let tripInterval = null;
let tripSecs = 0;
let sosInterval = null;
let sosSecs = 0;
let currentScore = 75;

// ===== SPLASH =====
function enableLocation() {
  const splash = document.getElementById('splashScreen');
  splash.style.transition = 'opacity 0.5s';
  splash.style.opacity = '0';
  setTimeout(() => {
    splash.style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
  }, 500);
  setTimeout(() => animateScore(75), 900);
}

function searchMode() {
  enableLocation();
  setTimeout(() => {
    const inp = document.getElementById('destSearch');
    if (inp) inp.focus();
  }, 700);
}

// ===== TABS =====
function showTab(tab) {
  ['home','map','sos','contacts','alerts'].forEach(t => {
    document.getElementById('page-' + t).style.display = 'none';
    document.getElementById('tab-' + t).classList.remove('active');
  });
  document.getElementById('page-' + tab).style.display = 'block';
  document.getElementById('tab-' + tab).classList.add('active');
  // Clear badge when alerts opened
  if (tab === 'alerts') {
    const badge = document.getElementById('alertBadge');
    if (badge) badge.style.display = 'none';
  }
}

// ===== SCORE =====
function animateScore(target) {
  currentScore = target;
  const arc = document.getElementById('scoreArc');
  const num = document.getElementById('scoreNum');
  const label = document.getElementById('scoreLabel');
  const desc = document.getElementById('scoreDesc');
  if (!arc) return;
  const circumference = 2 * Math.PI * 32; // ~201
  const offset = circumference - (target / 100) * circumference;
  arc.style.strokeDashoffset = offset;
  let color, lbl, d;
  if (target >= 75) {
    color = '#22c55e'; lbl = 'Moderate Safe';
    d = 'Well-lit main road. Moderate foot traffic. Low recent incidents.';
  } else if (target >= 50) {
    color = '#f59e0b'; lbl = 'Use Caution';
    d = 'Mixed lighting. Low foot traffic. 3+ incidents in 48 hrs. Stay alert.';
  } else {
    color = '#ef4444'; lbl = 'High Risk';
    d = 'Poor lighting. Isolated area. Multiple recent incidents. Avoid if possible.';
  }
  arc.style.stroke = color;
  num.style.color = color;
  num.textContent = target;
  label.style.color = color;
  label.textContent = lbl;
  desc.textContent = d;
}

// ===== ROUTES =====
function selectRoute(el, score, name, time) {
  document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const sub = document.getElementById('tripSub');
  if (sub) sub.textContent = name + ' · ' + score + '% safe · ' + time;
  animateScore(score);
}

// ===== TRIP =====
function toggleTrip() {
  tripActive = !tripActive;
  const btn = document.getElementById('tripBtn');
  const dot = document.getElementById('tripDot');
  const panel = document.getElementById('tripPanel');
  const txt = document.getElementById('tripText');
  const sub = document.getElementById('tripSub');
  const statsArea = document.getElementById('tripStatsArea');

  if (tripActive) {
    btn.className = 'trip-btn end';
    btn.innerHTML = '<i class="ti ti-player-stop" style="font-size:14px;vertical-align:-2px;margin-right:6px"></i> End Trip & Confirm Safe';
    dot.classList.add('active');
    panel.classList.add('active');
    txt.textContent = 'Trip Active';
    sub.textContent = 'Tracking · Broadcasting to trusted circle';
    statsArea.innerHTML = `
      <div class="trip-stats">
        <div class="trip-stat"><div class="trip-stat-val" id="ts-dist">0.0</div><div class="trip-stat-lbl">km covered</div></div>
        <div class="trip-stat"><div class="trip-stat-val" id="ts-time">00:00</div><div class="trip-stat-lbl">elapsed</div></div>
        <div class="trip-stat"><div class="trip-stat-val" id="ts-score" style="color:#22c55e">${currentScore}</div><div class="trip-stat-lbl">safety score</div></div>
      </div>`;
    tripSecs = 0;
    tripInterval = setInterval(() => {
      tripSecs++;
      const m = String(Math.floor(tripSecs / 60)).padStart(2, '0');
      const s = String(tripSecs % 60).padStart(2, '0');
      const el1 = document.getElementById('ts-time');
      const el2 = document.getElementById('ts-dist');
      if (el1) el1.textContent = m + ':' + s;
      if (el2) el2.textContent = (tripSecs * 0.004).toFixed(1);
    }, 1000);
  } else {
    if (tripInterval) clearInterval(tripInterval);
    btn.className = 'trip-btn';
    btn.innerHTML = '<i class="ti ti-player-play" style="font-size:14px;vertical-align:-2px;margin-right:6px"></i> Begin Trip Tracking';
    dot.classList.remove('active');
    panel.classList.remove('active');
    txt.textContent = 'Start Safe Trip';
    sub.textContent = 'Route A selected · 89% safe · 12 min';
    statsArea.innerHTML = '';
    alert('Trip ended. Your trusted circle has been notified you arrived safely! ✅');
  }
}

// ===== SOS =====
function triggerSOS() {
  document.getElementById('sosNormal').style.display = 'none';
  document.getElementById('sosTriggered').style.display = 'block';
  sosSecs = 0;
  sosInterval = setInterval(() => {
    sosSecs++;
    const m = String(Math.floor(sosSecs / 60)).padStart(2, '0');
    const s = String(sosSecs % 60).padStart(2, '0');
    const el = document.getElementById('sosTimer');
    if (el) el.textContent = m + ':' + s;
  }, 1000);
}

function cancelSOS() {
  clearInterval(sosInterval);
  document.getElementById('sosNormal').style.display = 'block';
  document.getElementById('sosTriggered').style.display = 'none';
}

// ===== REPORT =====
function doReport() {
  const types = ['Suspicious activity', 'Poor/no street lighting', 'Unsafe road condition', 'Harassment incident', 'Broken CCTV / infrastructure'];
  const t = types[Math.floor(Math.random() * types.length)];
  showTab('map');
  setTimeout(() => {
    const feed = document.getElementById('incidentFeed');
    if (!feed) return;
    const div = document.createElement('div');
    div.className = 'alert-card new';
    div.style.borderLeftColor = 'var(--green)';
    div.innerHTML = `
      <div class="alert-icon-wrap alert-icon-green"><i class="ti ti-check"></i></div>
      <div class="alert-body">
        <div class="alert-title">Report submitted — thank you!</div>
        <div class="alert-desc">${t} logged. Safety scores updated. Nearby users notified.</div>
        <div class="alert-time"><i class="ti ti-clock" style="font-size:10px"></i> Just now</div>
      </div>`;
    feed.prepend(div);
  }, 100);
}

// ===== SHARE =====
function doShare() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText('https://nightwatch.app/track/live_8f3k9x').catch(() => {});
  }
  alert('📍 Live location link copied!\n\nnightwatch.app/track/live_8f3k9x\n\nShare this with anyone to let them follow your journey in real time.');
}

// ===== SEARCH =====
function searchRoute() {
  const val = document.getElementById('destSearch').value.trim();
  if (!val) return;
  document.getElementById('destSearch').value = '';
  const s = Math.floor(Math.random() * 45) + 45;
  animateScore(s);
  const sub = document.getElementById('tripSub');
  if (sub) sub.textContent = 'To: ' + val + ' · ' + s + '% safe';
}

// Allow Enter key in search
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('destSearch');
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') searchRoute(); });
});