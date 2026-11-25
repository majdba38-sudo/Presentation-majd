/* ============================================================
   CASE FILE 001 — Presentation controller
   ============================================================ */

(function () {
  'use strict';

  const D = window.CASE_DATA;
  const FX = window.SlideFX;
  const Sound = window.SoundEngine;
  const gsap = window.gsap;
  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.from((root || document).querySelectorAll(sel)); };

  const slides = $$('.slide');
  const deck = $('#deck');
  const TOTAL = slides.length;

  let current = 0;
  let animating = false;
  let pending = null;
  let lastFocus = null;

  const store = {
    get: function (key) { try { return localStorage.getItem('cf001_' + key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem('cf001_' + key, value); } catch (e) { /* private mode */ } }
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2300);
  }

  /* ======================================================== rendering */
  function renderSuspects() {
    $('#suspectsGrid').innerHTML = D.suspects.map(function (s, i) {
      return '<button class="suspect-card" type="button" data-suspect="' + i + '" aria-label="فتح ملف المشتبه به ' + escapeHtml(s.name) + '">' +
        '<span class="suspect-top"><span class="suspect-num">FILE ' + s.num + '</span><span class="suspect-icon">' + s.icon + '</span></span>' +
        '<h3 class="suspect-name">' + escapeHtml(s.name) + '</h3>' +
        '<p class="suspect-quote">«' + escapeHtml(s.quote) + '»</p>' +
        '<span class="suspect-open">اضغط لفتح الملف ←</span>' +
        '</button>';
    }).join('');
  }

  function renderEvidence() {
    $('#evidenceGrid').innerHTML = D.evidence.map(function (e, i) {
      return '<button class="evidence-card" type="button" data-evidence="' + i + '" aria-label="عرض تفاصيل ' + escapeHtml(e.name) + '">' +
        '<span class="evidence-icon">' + e.icon + '</span>' +
        '<span class="evidence-code">' + e.code + ' · EXHIBIT</span>' +
        '<span class="evidence-name">' + escapeHtml(e.name) + '</span>' +
        '<span class="evidence-hint">اضغط للتفاصيل ←</span>' +
        '</button>';
    }).join('');
  }

  function renderProfiles() {
    $('#profilesGrid').innerHTML = D.profiles.map(function (p) {
      return '<article class="profile-card">' +
        '<span class="profile-badge">' + p.badge + '</span>' +
        '<div><h3 class="profile-name">' + escapeHtml(p.name) + '</h3>' +
        '<p class="profile-role">' + escapeHtml(p.role) + '</p></div>' +
        '<p class="profile-quote">' + escapeHtml(p.quote) + '</p>' +
        '<p class="profile-source">' + escapeHtml(p.source) + '</p>' +
        '</article>';
    }).join('');
  }

  function renderFindings() {
    $('#findingsList').innerHTML = D.findings.map(function (text, i) {
      return '<li class="finding"><span class="finding-num">' + pad(i + 1) + '</span>' +
        '<span class="finding-text">' + escapeHtml(text) + '</span>' +
        '<span class="finding-check" aria-hidden="true">✓</span></li>';
    }).join('');
  }

  function renderMenu() {
    $('#menuGrid').innerHTML = D.slides.map(function (title, i) {
      return '<button class="menu-item" type="button" data-goto="' + i + '" aria-label="الشريحة ' + (i + 1) + ': ' + escapeHtml(title) + '">' +
        '<span class="num">' + pad(i + 1) + '</span>' +
        '<span class="label">' + escapeHtml(title) + '</span>' +
        '<span class="menu-dot" aria-hidden="true"></span>' +
        '</button>';
    }).join('');
  }

  function restoreFields() {
    D.questions.concat([{ id: 'commitment' }]).forEach(function (q) {
      const el = $('#' + q.id);
      if (el) el.value = store.get(q.id) || '';
    });
  }

  /* ======================================================== navigation */
  function updateHUD() {
    $('#currentNum').textContent = pad(current + 1);
    $('#progressFill').style.transform = 'scaleX(' + ((current + 1) / TOTAL) + ')';
    $('#prevBtn').disabled = current === 0;
    $('#nextBtn').disabled = current === TOTAL - 1;
    $$('.menu-item').forEach(function (item, i) {
      item.classList.toggle('is-current', i === current);
    });
  }

  function closeDossier(instant) {
    const panel = $('#dossier');
    if (!panel || panel.getAttribute('aria-hidden') === 'true') return;
    $$('.suspect-card').forEach(function (card) { card.classList.remove('is-selected'); });
    panel.setAttribute('aria-hidden', 'true');
    if (gsap) gsap.killTweensOf(panel);
    if (instant || !gsap || FX.reduced.value) {
      if (gsap) gsap.set(panel, { autoAlpha: 0 });
      else panel.style.visibility = 'hidden';
      return;
    }
    gsap.to(panel, { autoAlpha: 0, x: -20, duration: 0.3, ease: 'power2.in' });
  }

  function goTo(index) {
    index = Math.max(0, Math.min(TOTAL - 1, index));
    if (index === current) return;
    if (animating) { pending = index; return; }

    const outgoing = slides[current];
    const incoming = slides[index];
    const dir = index > current ? 1 : -1;

    closeMenu(true);
    closeModal(true);
    closeDossier(true);
    Sound.click();
    if (index === TOTAL - 1) Sound.stamp();

    current = index;
    updateHUD();
    animating = true;

    if (!gsap || FX.reduced.value) {
      if (gsap) {
        gsap.set(outgoing, { autoAlpha: 0, zIndex: 0 });
        gsap.set(incoming, { autoAlpha: 1, zIndex: 1 });
        FX.enter(incoming, dir);
      } else {
        outgoing.style.visibility = 'hidden';
        outgoing.style.opacity = '0';
        incoming.style.visibility = 'visible';
        incoming.style.opacity = '1';
      }
      animating = false;
      flushPending();
      return;
    }

    gsap.killTweensOf(outgoing);
    gsap.killTweensOf(incoming);
    gsap.set(outgoing, { zIndex: 2 });
    gsap.set(incoming, { zIndex: 3 });

    FX.exit(outgoing, dir);
    FX.enter(incoming, dir);

    gsap.delayedCall(0.72, function () {
      gsap.set(outgoing, { autoAlpha: 0, zIndex: 0 });
      gsap.set(incoming, { zIndex: 1 });
      animating = false;
      flushPending();
    });
  }

  function flushPending() {
    if (pending !== null) {
      const next = pending;
      pending = null;
      goTo(next);
    }
  }

  /* ======================================================== overlays */
  let menuOpen = false;
  let modalOpen = false;

  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;
    lastFocus = document.activeElement;
    const overlay = $('#menuOverlay');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    Sound.click();
    const first = $('.menu-item.is-current') || $('.menu-item');
    if (first) first.focus();
  }

  function closeMenu(instant) {
    if (!menuOpen) return;
    menuOpen = false;
    const overlay = $('#menuOverlay');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (instant) return;
  }

  function toggleMenu() { menuOpen ? closeMenu() : openMenu(); }

  function openModal(html) {
    if (modalOpen) return;
    modalOpen = true;
    lastFocus = document.activeElement;
    $('#modalContent').innerHTML = html;
    const overlay = $('#modalOverlay');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    Sound.click();
    $('#modalClose').focus();
    if (gsap && !FX.reduced.value) {
      gsap.fromTo('.modal-card',
        { autoAlpha: 0, y: 30, scale: 0.96, rotation: -3 },
        { autoAlpha: 1, y: 0, scale: 1, rotation: -0.6, duration: 0.5, ease: 'power3.out' });
    }
  }

  function closeModal(instant) {
    if (!modalOpen) return;
    modalOpen = false;
    const overlay = $('#modalOverlay');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (instant) return;
  }

  function showEvidence(index) {
    const e = D.evidence[index];
    openModal(
      '<div class="modal-kicker">Exhibit ' + e.code + ' · Evidence file</div>' +
      '<h3 id="modalTitle">' + escapeHtml(e.name) + '</h3>' +
      '<div class="modal-meta">مضبوط داخل الملف رقم 001</div>' +
      '<div class="modal-divider"></div>' +
      '<p class="modal-label">وصف المضبوط</p>' +
      '<p class="modal-text">' + escapeHtml(e.intro) + '</p>' +
      '<p class="modal-text">' + escapeHtml(e.details) + '</p>' +
      '<div class="modal-note">' + escapeHtml(e.note) + '</div>' +
      '<span class="modal-stamp">' + escapeHtml(e.stamp) + '</span>'
    );
  }

  function showSuspect(index) {
    const s = D.suspects[index];
    const body = $('#dossierBody');
    body.innerHTML =
      '<div class="dossier-kicker">SUSPECT ' + s.num + ' · ' + escapeHtml(s.file) + '</div>' +
      '<h3>' + escapeHtml(s.name) + '</h3>' +
      '<p class="dossier-quote">«' + escapeHtml(s.quote) + '»</p>' +
      '<p class="dossier-row"><strong>الوصف:</strong> ' + escapeHtml(s.type) + '</p>' +
      s.notes.map(function (n) { return '<p class="dossier-row">• ' + escapeHtml(n) + '</p>'; }).join('') +
      '<p class="dossier-row"><strong>خلاصة المحقق:</strong> ' + escapeHtml(s.conclusion) + '</p>' +
      '<span class="stamp">' + escapeHtml(s.stamp) + '</span>';

    $$('.suspect-card').forEach(function (card, i) {
      card.classList.toggle('is-selected', i === index);
    });

    const panel = $('#dossier');
    panel.setAttribute('aria-hidden', 'false');
    Sound.click();
    if (gsap && !FX.reduced.value) {
      gsap.fromTo(panel,
        { autoAlpha: 0, x: -34, scale: 0.97 },
        { autoAlpha: 1, x: 0, scale: 1, duration: 0.45, ease: 'power3.out' });
    } else if (gsap) {
      gsap.set(panel, { autoAlpha: 1 });
    } else {
      panel.style.visibility = 'visible';
      panel.style.opacity = '1';
    }
  }

  /* ======================================================== utilities */
  function toggleFullscreen() {
    const doc = document;
    const el = doc.documentElement;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      const request = el.requestFullscreen || el.webkitRequestFullscreen;
      if (request) {
        const result = request.call(el);
        if (result && result.catch) result.catch(function () { toast('تعذّر تفعيل ملء الشاشة'); });
      } else toast('ملء الشاشة غير مدعوم في هذا المتصفح');
    } else {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
      if (exit) exit.call(doc);
    }
  }

  function applySound(on) {
    const active = Sound.setEnabled(on);
    const btn = $('#soundBtn');
    btn.classList.toggle('is-on', !!active);
    btn.setAttribute('aria-label', active ? 'إيقاف الصوت' : 'تشغيل الصوت');
    store.set('sound', active ? '1' : '0');
    if (active) Sound.chime();
    toast(active ? 'تم تشغيل الصوت' : 'تم كتم الصوت');
  }

  function applyMotion(reduced) {
    FX.reduced.value = !!reduced;
    document.body.classList.toggle('reduced', !!reduced);
    const btn = $('#motionBtn');
    btn.classList.toggle('is-on', !!reduced);
    btn.setAttribute('aria-label', reduced ? 'إعادة الحركة' : 'تقليل الحركة');
    store.set('motion', reduced ? '1' : '0');
    if (gsap && reduced) {
      const s = slides[current];
      gsap.killTweensOf(s.querySelectorAll('*'));
      gsap.set(s.querySelectorAll('*'), { clearProps: 'opacity,visibility,transform,filter' });
      gsap.set(s, { autoAlpha: 1 });
    }
    toast(reduced ? 'تم تقليل الحركة' : 'تمت إعادة الحركة');
  }

  function printCommitment() {
    const answers = D.questions.map(function (q) {
      const value = ($('#' + q.id).value || '').trim() || '—';
      return '<div class="print-answer"><span>' + escapeHtml(q.label) + '</span><p>' + escapeHtml(value) + '</p></div>';
    }).join('');
    $('#printAnswers').innerHTML = answers;
    $('#printCommit').textContent = ($('#commitment').value || '').trim() || '—';
    Sound.click();
    setTimeout(function () { window.print(); }, 120);
  }

  /* ======================================================== events */
  function bindEvents() {
    $('#nextBtn').addEventListener('click', function () { goTo(current + 1); });
    $('#prevBtn').addEventListener('click', function () { goTo(current - 1); });

    document.addEventListener('click', function (e) {
      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        const action = actionEl.dataset.action;
        if (action === 'next') goTo(current + 1);
        if (action === 'restart') { goTo(0); toast('تمت إعادة العرض'); }
        return;
      }
      const suspectEl = e.target.closest('[data-suspect]');
      if (suspectEl) { showSuspect(Number(suspectEl.dataset.suspect)); return; }
      const evidenceEl = e.target.closest('[data-evidence]');
      if (evidenceEl) { showEvidence(Number(evidenceEl.dataset.evidence)); return; }
      const gotoEl = e.target.closest('[data-goto]');
      if (gotoEl) { closeMenu(); goTo(Number(gotoEl.dataset.goto)); return; }
    });

    $('#menuBtn').addEventListener('click', toggleMenu);
    $('#menuClose').addEventListener('click', closeMenu);
    $('#modalClose').addEventListener('click', closeModal);
    $('#dossierClose').addEventListener('click', function () { closeDossier(); });

    $('#menuOverlay').addEventListener('click', function (e) {
      if (e.target === this) closeMenu();
    });
    $('#modalOverlay').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    $('#restartBtn').addEventListener('click', function () { goTo(0); toast('تمت إعادة العرض من البداية'); });
    $('#fullscreenBtn').addEventListener('click', toggleFullscreen);
    $('#soundBtn').addEventListener('click', function () { applySound(!Sound.enabled); });
    $('#motionBtn').addEventListener('click', function () { applyMotion(!FX.reduced.value); });
    $('#printBtn').addEventListener('click', printCommitment);

    document.addEventListener('fullscreenchange', syncFullscreenButton);
    document.addEventListener('webkitfullscreenchange', syncFullscreenButton);

    D.questions.concat([{ id: 'commitment' }]).forEach(function (q) {
      const el = $('#' + q.id);
      if (el) el.addEventListener('input', function () { store.set(q.id, el.value); });
    });

    document.addEventListener('keydown', function (e) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

      if (e.key === 'Escape') {
        if (modalOpen) closeModal();
        else if (menuOpen) closeMenu();
        else if ($('#dossier').getAttribute('aria-hidden') === 'false') closeDossier();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault(); goTo(current - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault(); goTo(current + 1);
      } else if (e.key === 'Home') {
        e.preventDefault(); goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault(); goTo(TOTAL - 1);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'm') {
        toggleMenu();
      }
    });

    let touchX = 0, touchY = 0;
    deck.addEventListener('touchstart', function (e) {
      const t = e.changedTouches[0];
      touchX = t.clientX; touchY = t.clientY;
    }, { passive: true });
    deck.addEventListener('touchend', function (e) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchX;
      const dy = t.clientY - touchY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        goTo(current + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  function syncFullscreenButton() {
    const active = !!(document.fullscreenElement || document.webkitFullscreenElement);
    $('#fullscreenBtn').classList.toggle('is-on', active);
  }

  /* ======================================================== boot */
  function init() {
    renderSuspects();
    renderEvidence();
    renderProfiles();
    renderFindings();
    renderMenu();
    restoreFields();
    bindEvents();

    if (!gsap) {
      slides.forEach(function (s, i) {
        s.style.visibility = i === 0 ? 'visible' : 'hidden';
        s.style.opacity = i === 0 ? '1' : '0';
      });
      updateHUD();
      return;
    }

    gsap.set(slides, { autoAlpha: 0, zIndex: 0 });
    gsap.set(slides[0], { autoAlpha: 1, zIndex: 1 });

    const savedMotion = store.get('motion');
    FX.reduced.value = savedMotion === null
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : savedMotion === '1';
    document.body.classList.toggle('reduced', FX.reduced.value);
    $('#motionBtn').classList.toggle('is-on', FX.reduced.value);

    if (store.get('sound') === '1') {
      $('#soundBtn').classList.add('is-on');
      Sound.setEnabled(true);
      setTimeout(function () { Sound.chime(); }, 400);
    }

    updateHUD();
    FX.enter(slides[0], 1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
