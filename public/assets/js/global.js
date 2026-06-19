/* global.js — XAYZ Platform Shared Logic */
'use strict';

// ── Drawer / Hamburger ──────────────────────────────────────────────────────
(function initDrawer() {
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!hamburger || !drawer || !overlay) return;

  function open() {
    hamburger.classList.add('active');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    hamburger.classList.remove('active');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', () => drawer.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);

  // Highlight active menu
  const path = window.location.pathname;
  document.querySelectorAll('.drawer-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
})();

// ── Toast ────────────────────────────────────────────────────────────────────
window.toast = function(msg, type = 'info', duration = 3000) {
  let wrap = document.getElementById('toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toast-wrap';
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(14px)'; el.style.transition = '0.3s'; setTimeout(() => el.remove(), 350); }, duration);
};

// ── Copy to Clipboard ────────────────────────────────────────────────────────
window.copyText = function(text, label = 'Copied!') {
  navigator.clipboard.writeText(text).then(() => toast(label, 'success')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast(label, 'success');
  });
};

// ── Raw JSON Box ─────────────────────────────────────────────────────────────
window.renderJsonBox = function(container, data, redirectUrl) {
  if (!container) return;
  const pretty = JSON.stringify(data, null, 2);
  container.innerHTML = `
    <div class="json-box fade-up">
      <div class="json-box-header">
        <span class="json-box-title">⬡ RAW JSON RESPONSE</span>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost btn-sm" onclick="copyText(${JSON.stringify(pretty)}, 'JSON Copied!')">📋 Copy JSON</button>
          ${redirectUrl ? `<a href="${redirectUrl}" target="_blank" class="btn btn-ghost btn-sm">🔗 Redirect JSON</a>` : ''}
        </div>
      </div>
      <pre>${escapeHtml(pretty)}</pre>
    </div>`;
};

window.escapeHtml = function(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};

// ── API Base ─────────────────────────────────────────────────────────────────
window.API_BASE = '/xayz/yt-machine/api';
window.getApiKey = () => localStorage.getItem('xayz_apikey') || 'XAYZ-FREE-0000-0000';
window.setApiKey = (k) => localStorage.setItem('xayz_apikey', k);

window.apiCall = async function(endpoint, params = {}, method = 'GET') {
  const key = getApiKey();
  let url = `${API_BASE}/${endpoint}`;
  const headers = { 'x-api-key': key, 'Content-Type': 'application/json' };
  let options = { method, headers };

  if (method === 'GET') {
    const p = new URLSearchParams(params);
    url += '?' + p.toString();
  } else {
    options.body = JSON.stringify(params);
  }

  const res = await fetch(url, options);
  return res.json();
};

// ── Particle effect (lightweight) ────────────────────────────────────────────
window.initParticles = function(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * 2000,
      y: Math.random() * 1000,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.1,
      c: Math.random() > 0.5 ? '99,102,241' : '245,158,11'
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x % W, p.y % H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
};
