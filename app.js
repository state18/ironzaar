'use strict';

// Hide broken-image icons for missing placeholders
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => { img.style.opacity = '0'; });
});

const heroResult  = document.getElementById('heroResult');
const heroLabel   = document.getElementById('heroLabel');
const heroTime    = document.getElementById('heroTime');
const heroBg      = document.getElementById('heroBg');
const historyList = document.getElementById('historyList');
const kaizoToggle = document.getElementById('kaizoToggle');
const kaizoSection = document.getElementById('kaizoSection');

const MAX_HISTORY = 20;

// ── Core RNG ──────────────────────────────────────────────
function rollRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Display helpers ───────────────────────────────────────
function showResult(resultText, labelText, imagePath = null) {
  if (imagePath) {
    heroBg.src = imagePath;
    heroBg.classList.add('visible');
  } else {
    heroBg.classList.remove('visible');
  }

  const now  = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  heroResult.textContent = resultText;
  heroLabel.textContent  = labelText;
  heroTime.textContent   = time;

  // Trigger pulse animation (re-add class each call)
  heroResult.classList.remove('pulse');
  void heroResult.offsetWidth; // force reflow
  heroResult.classList.add('pulse');

  addHistory(labelText, resultText);
}

function addHistory(label, value) {
  // Remove empty placeholder
  const empty = historyList.querySelector('.history-empty');
  if (empty) empty.remove();

  const now  = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const li = document.createElement('li');
  li.innerHTML = `
    <div class="history-label">${escHtml(label)}</div>
    <div class="history-value">${escHtml(value)}</div>
    <div class="history-time">${time}</div>
  `;

  historyList.prepend(li);

  // Trim to max
  const items = historyList.querySelectorAll('li');
  if (items.length > MAX_HISTORY) {
    items[items.length - 1].remove();
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Roll handlers ─────────────────────────────────────────

// Generic 1-N roll
function roll(label, min, max) {
  const n = rollRange(min, max);
  showResult(String(n), `${label} (${min}–${max}) → ${n}`);
}

// Custom range from inputs
function rollCustom() {
  const min = parseInt(document.getElementById('customMin').value, 10);
  const max = parseInt(document.getElementById('customMax').value, 10);
  if (isNaN(min) || isNaN(max) || min > max) {
    showResult('!', 'Invalid range — min must be ≤ max');
    return;
  }
  const n = rollRange(min, max);
  showResult(String(n), `Custom (${min}–${max}) → ${n}`);
}

// Aerodrome: 1 = reroll node, 2 = select location
function rollAerodrome() {
  const n = rollRange(1, 2);
  const action = n === 1 ? 'REROLL NODE' : 'SELECT LOCATION';
  showResult(action, `Aerodrome (1–2) → ${n} = ${action}`, 'images/aerodrome.png');
}

// Likkit: 1-2 for Treats vs Creations; if Creations → chain to 1-3
function rollLikkit() {
  const first = rollRange(1, 2);
  if (first === 1) {
    showResult('FIVE TREATS', 'Likkit → 1 = Five Treats (pick what you want)', 'images/likkit.png');
  } else {
    const second = rollRange(1, 3);
    showResult(`CREATION ${second}`, `Likkit → 2 = Creations → then rolled ${second} of 3`, 'images/likkit.png');
  }
}

// Gumball Machine: 0-10 gumballs
function rollGumball() {
  const n = rollRange(0, 10);
  const msg = n === 0 ? 'Buy 0 (skip)' : `Buy ${n} gumball${n > 1 ? 's' : ''}`;
  showResult(String(n), `Gumball Machine (0–10) → ${msg}`, 'images/gumball.png');
}

// Pearl's Dig Site (Kaizo): roll 1-5
function rollDigSite() {
  const n = rollRange(1, 5);
  showResult(String(n), `Pearl's Dig Site (1–5) → Dig ${n} time${n > 1 ? 's' : ''}`, 'images/kaizo-dig-site.png');
}

// Clear history log
function clearHistory() {
  historyList.innerHTML = '<li class="history-empty">No rolls yet</li>';
}

// ── Kaizo toggle ──────────────────────────────────────────
kaizoToggle.addEventListener('change', () => {
  kaizoSection.style.display = kaizoToggle.checked ? 'block' : 'none';
});
