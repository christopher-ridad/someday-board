// Small shared DOM/UI helpers used by every screen.

import { COLORS } from './constants.js';

export const $ = (id) => document.getElementById(id);

export function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

export function burstConfetti() {
  const n = 26;
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = (10 + Math.random() * 80) + '%';
    el.style.background = COLORS[i % COLORS.length];
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(el);
    const duration = 1800 + Math.random() * 1200;
    const drift = (Math.random() - 0.5) * 160;
    el.animate([
      { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${drift}px, ${window.innerHeight}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0.9 }
    ], { duration, easing: 'cubic-bezier(0.2,0.6,0.4,1)' });
    setTimeout(() => el.remove(), duration + 50);
  }
}
