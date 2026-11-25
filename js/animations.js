/* ============================================================
   CASE FILE 001 — GSAP entrance / exit choreography
   ============================================================ */

window.SlideFX = (function () {
  'use strict';

  const G = window.gsap;
  const reduced = { value: false };

  const one = (root, sel) => root.querySelector(sel);
  const many = (root, sel) => Array.from(root.querySelectorAll(sel));
  const head = (root) => many(root, '.slide-head > *');

  /* Typewriter that never shifts layout: text length changes only inside a
     fixed-height element. */
  function typewriter(el, duration) {
    const full = el.dataset.text || el.textContent || '';
    if (reduced.value) {
      el.textContent = full;
      el.classList.remove('is-typing');
      return G ? G.timeline() : null;
    }
    const state = { i: 0 };
    el.textContent = '';
    el.classList.add('is-typing');
    return G.to(state, {
      i: full.length,
      duration: duration || 1.1,
      ease: 'none',
      onUpdate: function () {
        el.textContent = full.slice(0, Math.floor(state.i));
      },
      onComplete: function () {
        el.textContent = full;
        el.classList.remove('is-typing');
      }
    });
  }

  function resetSlide(slide) {
    if (!G) return;
    G.set(many(slide, '*'), {
      clearProps: 'opacity,visibility,transform,filter,strokeDasharray,strokeDashoffset'
    });
    many(slide, '[data-type]').forEach(function (el) {
      el.textContent = el.dataset.text || el.textContent;
      el.classList.remove('is-typing');
    });
  }

  function fadeHead(tl, root, at) {
    tl.fromTo(head(root), { autoAlpha: 0, y: -14 },
      { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, at || 0);
  }

  /* ---------------------------------------------------------- entrances */
  const entrances = {

    cover: function (slide) {
      const tl = G.timeline();
      tl.fromTo(one(slide, '.folder-flap'),
          { rotationX: 0, transformOrigin: 'top center' },
          { rotationX: -118, duration: 1.05, ease: 'power3.inOut' }, 0)
        .fromTo(one(slide, '.folder-sheet'),
          { autoAlpha: 0, y: 28, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' }, 0.35)
        .fromTo(one(slide, '.cover-kicker'),
          { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.65)
        .add(typewriter(one(slide, '.cover-title'), 1.2), 0.8)
        .fromTo(many(slide, '.ornament-rule, .cover-sub'),
          { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.5 }, 1.4)
        .fromTo(one(slide, '.cover-inner .btn'),
          { autoAlpha: 0, y: 16, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.5)' }, 1.6)
        .fromTo(one(slide, '.stamp--confidential'),
          { autoAlpha: 0, scale: 1.9, rotation: -28 },
          { autoAlpha: 0.86, scale: 1, rotation: -11, duration: 0.5, ease: 'back.out(2)' }, 1.8)
        .fromTo(one(slide, '.cover-footnote'),
          { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.9);
      return tl;
    },

    typewriter: function (slide) {
      const tl = G.timeline();
      tl.fromTo(one(slide, '.document'),
          { autoAlpha: 0, y: 42, rotation: -3, scale: 0.97 },
          { autoAlpha: 1, y: 0, rotation: -0.7, scale: 1, duration: 0.8, ease: 'power3.out' }, 0)
        .fromTo(many(slide, '.doc-head, .document .slide-title, .doc-rule'),
          { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.45 }, 0.35);
      many(slide, '[data-type]').forEach(function (el, i) {
        tl.add(typewriter(el, 0.95), 0.7 + i * 0.9);
      });
      tl.fromTo(one(slide, '.magnifier'),
          { autoAlpha: 0, x: 46, y: 22, scale: 0.8 },
          { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' }, 1.3)
        .fromTo(one(slide, '.stamp--received'),
          { autoAlpha: 0, scale: 1.7, rotation: -30 },
          { autoAlpha: 0.86, scale: 1, rotation: -9, duration: 0.45, ease: 'back.out(2)' }, 3.2);
      return tl;
    },

    wanted: function (slide) {
      const tl = G.timeline();
      fadeHead(tl, slide, 0);
      tl.fromTo(one(slide, '.wanted-card'),
          { autoAlpha: 0, y: 42, rotation: 5, scale: 0.94 },
          { autoAlpha: 1, y: 0, rotation: 0.8, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.25)
        .fromTo(many(slide, '.wanted-band, .wanted-photo, .wanted-name, .wanted-divider'),
          { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.45 }, 0.6)
        .fromTo(many(slide, '.pin'),
          { autoAlpha: 0, scale: 0 },
          { autoAlpha: 1, scale: 1, stagger: 0.12, duration: 0.35, ease: 'back.out(3)' }, 0.9)
        .fromTo(many(slide, '.wanted-traits li'),
          { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, stagger: 0.13, duration: 0.45 }, 1.1)
        .fromTo(one(slide, '.wanted-foot'),
          { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 1.75);
      return tl;
    },

    scene: function (slide) {
      const tl = G.timeline();
      tl.fromTo(one(slide, '.scene-map'),
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 0)
        .fromTo(one(slide, '.map-route'),
          { autoAlpha: 0, strokeDashoffset: 260 },
          { autoAlpha: 1, strokeDashoffset: 0, duration: 1.2, ease: 'none' }, 0.4)
        .fromTo(one(slide, '.map-ring'),
          { autoAlpha: 0, scale: 0.15, svgOrigin: '210 210' },
          { autoAlpha: 1, scale: 1, duration: 0.75, ease: 'back.out(1.5)' }, 0.9)
        .fromTo(many(slide, '.map-cross, .map-pin'),
          { autoAlpha: 0, scale: 0, svgOrigin: '210 210' },
          { autoAlpha: 1, scale: 1, stagger: 0.1, duration: 0.4, ease: 'back.out(2)' }, 1.3)
        .fromTo(one(slide, '.scene-tag'),
          { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.4 }, 1.5)
        .fromTo(many(slide, '.scene-text > *'),
          { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.5 }, 0.5);
      return tl;
    },

    suspects: function (slide) {
      const tl = G.timeline();
      fadeHead(tl, slide, 0);
      many(slide, '.suspect-card').forEach(function (card, i) {
        tl.fromTo(card,
          { autoAlpha: 0, y: 44, rotation: i % 2 ? 2 : -2 },
          { autoAlpha: 1, y: 0, rotation: 0, duration: 0.6, ease: 'back.out(1.3)' }, 0.35 + i * 0.16);
      });
      return tl;
    },

    'evidence-grid': function (slide) {
      const tl = G.timeline();
      fadeHead(tl, slide, 0);
      many(slide, '.evidence-card').forEach(function (card, i) {
        tl.fromTo(card,
          { autoAlpha: 0, y: 36, scale: 0.9, rotation: i % 2 ? 7 : -7 },
          { autoAlpha: 1, y: 0, scale: 1, rotation: i % 2 ? 1 : -1, duration: 0.55, ease: 'back.out(1.5)' },
          0.35 + i * 0.15);
      });
      return tl;
    },

    revelation: function (slide) {
      const tl = G.timeline();
      tl.fromTo(one(slide, '.light-beam'),
          { autoAlpha: 0, scale: 1.25 },
          { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0)
        .fromTo(one(slide, '.revelation-card'),
          { autoAlpha: 0, y: 34, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.15)
        .fromTo(many(slide, '.revelation-card .eyebrow, .revelation-card .slide-title'),
          { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.5 }, 0.5)
        .fromTo(many(slide, '.quran-verse, .hadith-text'),
          { autoAlpha: 0, scale: 0.94, filter: 'blur(10px)' },
          { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }, 0.75)
        .fromTo(one(slide, '.source'),
          { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.25)
        .fromTo(one(slide, '.divider'),
          { autoAlpha: 0, scaleX: 0, transformOrigin: 'center center' },
          { autoAlpha: 1, scaleX: 1, duration: 0.5 }, 1.35)
        .fromTo(one(slide, '.message'),
          { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.6);
      return tl;
    },

    dual: function (slide) {
      const tl = G.timeline();
      fadeHead(tl, slide, 0);
      tl.fromTo(many(slide, '.verse-card'),
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, stagger: 0.2, duration: 0.6, ease: 'power3.out' }, 0.35)
        .fromTo(many(slide, '.verse-card .quran-verse'),
          { autoAlpha: 0, filter: 'blur(8px)' },
          { autoAlpha: 1, filter: 'blur(0px)', stagger: 0.2, duration: 0.8 }, 0.55)
        .fromTo(many(slide, '.verse-card .source'),
          { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.2, duration: 0.4 }, 1)
        .fromTo(one(slide, '.dual-message'),
          { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.2);
      return tl;
    },

    profiles: function (slide) {
      const tl = G.timeline();
      fadeHead(tl, slide, 0);
      tl.fromTo(many(slide, '.profile-card'),
          { autoAlpha: 0, y: 36, rotation: -2 },
          { autoAlpha: 1, y: 0, rotation: 0, stagger: 0.18, duration: 0.6, ease: 'power3.out' }, 0.35)
        .fromTo(many(slide, '.profile-badge'),
          { autoAlpha: 0, scale: 0 },
          { autoAlpha: 1, scale: 1, stagger: 0.18, duration: 0.45, ease: 'back.out(2)' }, 0.6)
        .fromTo(many(slide, '.profile-quote, .profile-source'),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.45 }, 0.85);
      return tl;
    },

    findings: function (slide) {
      const tl = G.timeline();
      fadeHead(tl, slide, 0);
      tl.fromTo(many(slide, '.finding'),
          { autoAlpha: 0, x: 40 },
          { autoAlpha: 1, x: 0, stagger: 0.14, duration: 0.55, ease: 'power3.out' }, 0.35)
        .fromTo(many(slide, '.finding-num'),
          { scale: 0, rotation: -45 },
          { scale: 1, rotation: 0, stagger: 0.14, duration: 0.45, ease: 'back.out(2)' }, 0.55)
        .fromTo(many(slide, '.finding-check'),
          { autoAlpha: 0, scale: 0 },
          { autoAlpha: 1, scale: 1, stagger: 0.14, duration: 0.35 }, 0.8)
        .fromTo(one(slide, '.findings-note'),
          { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.4);
      return tl;
    },

    closed: function (slide) {
      const tl = G.timeline();
      tl.set(many(slide, '.shutter-leaf--top'), { y: '-102%' }, 0)
        .set(many(slide, '.shutter-leaf--bottom'), { y: '102%' }, 0)
        .to(one(slide, '.shutter-leaf--top'), { y: '0%', duration: 0.55, ease: 'power3.inOut' }, 0)
        .to(one(slide, '.shutter-leaf--bottom'), { y: '0%', duration: 0.55, ease: 'power3.inOut' }, 0)
        .to(one(slide, '.shutter-leaf--top'), { y: '-102%', duration: 0.6, ease: 'power3.inOut' }, 0.72)
        .to(one(slide, '.shutter-leaf--bottom'), { y: '102%', duration: 0.6, ease: 'power3.inOut' }, 0.72);

      const conv = one(slide, '.conv-string');
      if (conv && conv.getTotalLength) {
        const len = conv.getTotalLength();
        tl.fromTo(conv,
          { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 1 },
          { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.9);
      }
      tl.fromTo(one(slide, '.conv-word'),
          { autoAlpha: 0, scale: 0.5, filter: 'blur(14px)' },
          { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'back.out(1.6)' }, 1.25)
        .fromTo(many(slide, '.closed-statement > *:not(.stamp)'),
          { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.5 }, 1.35)
        .fromTo(one(slide, '.mission'),
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.5)
        .fromTo(many(slide, '.mission > *'),
          { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.35 }, 1.7)
        .fromTo(one(slide, '.stamp--closed'),
          { autoAlpha: 0, scale: 1.8, rotation: -30 },
          { autoAlpha: 0.86, scale: 1, rotation: -11, duration: 0.45, ease: 'back.out(2)' }, 2.05);
      return tl;
    }
  };

  function runEnter(slide, dir) {
    if (!G) return null;
    resetSlide(slide);
    G.set(slide, { autoAlpha: 1 });
    if (reduced.value) return G.timeline();
    const kind = slide.dataset.anim || 'cover';
    const fn = entrances[kind] || function (s) {
      return G.fromTo(many(s, '.stage > *'),
        { autoAlpha: 0, y: 24 * dir }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.6 });
    };
    return fn(slide);
  }

  function exit(slide, dir) {
    if (!G) return null;
    if (reduced.value) return G.timeline().set(slide, { autoAlpha: 0 });
    return G.timeline()
      .to(many(slide, '.stage > *'), {
        autoAlpha: 0, y: -20 * dir, duration: 0.28, stagger: 0.025, ease: 'power2.in'
      }, 0)
      .to(slide, { autoAlpha: 0, duration: 0.34, ease: 'power1.inOut' }, 0.05);
  }

  return {
    enter: runEnter,
    exit: exit,
    typewriter: typewriter,
    reduced: reduced
  };
})();
