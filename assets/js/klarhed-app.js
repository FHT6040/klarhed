/**
 * KLARHED — frontend course app (vanilla ES2017, no build step)
 *
 * Mounts into every <div id="klarhed-root"> on the page.
 * Reads course content from window.KLARHED_BOOT (localized by PHP).
 * Syncs progress/answers with /wp-json/klarhed/v1/ when user is logged in;
 * falls back to localStorage for guests.
 */
(function () {
  'use strict';

  var BOOT = window.KLARHED_BOOT || {};
  var COURSE = BOOT.course || { title: 'KLARHED', chapters: [], baseline: { groups: [] } };
  var LS = 'klarhed_state_v1';
  var SAVE_DEBOUNCE = 1200;
  var state = loadLocal();
  var saveTimer = null;

  // ---------- state ----------
  function loadLocal() {
    try { var v = JSON.parse(localStorage.getItem(LS) || '{}');
      return { progress: v.progress || {}, fields: v.fields || {}, baseline: v.baseline || {}, finalMeasure: v.finalMeasure || {} };
    } catch (e) { return { progress: {}, fields: {}, baseline: {}, finalMeasure: {} }; }
  }
  function saveLocal() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }

  function scheduleSync() {
    saveLocal();
    if (!BOOT.loggedIn || !BOOT.restUrl) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      fetch(BOOT.restUrl + 'state', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': BOOT.nonce || '' },
        body: JSON.stringify(state)
      }).catch(function () { /* offline OK */ });
    }, SAVE_DEBOUNCE);
  }

  function loadRemote(done) {
    if (!BOOT.loggedIn || !BOOT.restUrl) return done();
    fetch(BOOT.restUrl + 'state', {
      credentials: 'same-origin',
      headers: { 'X-WP-Nonce': BOOT.nonce || '' }
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) {
        if (s) state = {
          progress: s.progress || {}, fields: s.fields || {},
          baseline: s.baseline || {}, finalMeasure: s.finalMeasure || {}
        };
        done();
      }).catch(done);
  }

  // ---------- tiny DOM helpers ----------
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class')       el.className = attrs[k];
      else if (k === 'html')   el.innerHTML = attrs[k];
      else if (k === 'text')   el.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function totalLessons() { return (COURSE.chapters || []).reduce(function (n, c) { return n + (c.lessons || []).length; }, 0); }
  function completedCount() { return Object.keys(state.progress).filter(function (k) { return state.progress[k]; }).length; }
  function pct() { var t = totalLessons(); return t ? Math.round(completedCount() / t * 100) : 0; }

  // ---------- router ----------
  var route = { view: 'home' };
  try { var r = JSON.parse(localStorage.getItem('klarhed_route') || 'null'); if (r) route = r; } catch (e) {}
  function go(next) { route = next; localStorage.setItem('klarhed_route', JSON.stringify(route)); renderAll(); window.scrollTo(0, 0); }

  // ---------- views ----------
  function Header() {
    return h('header', { class: 'kh-header' }, [
      h('div', { class: 'kh-header-inner' }, [
        h('button', { class: 'kh-brand', onclick: function () { go({ view: 'home' }); } }, [
          h('span', { class: 'kh-brand-serif', text: 'Klarhed' }),
          h('span', { class: 'kh-brand-slash', text: '/' }),
          h('span', { class: 'kh-brand-sans',  text: 'Lederskab' })
        ]),
        h('div', { class: 'kh-header-progress' }, [
          h('div', { class: 'kh-progress-track' }, [
            h('div', { class: 'kh-progress-fill', style: 'width:' + pct() + '%' })
          ]),
          h('span', { class: 'kh-progress-num', text: pct() + '%' })
        ])
      ])
    ]);
  }

  function Dashboard() {
    var wrap = h('div', { class: 'kh-container' }, [
      h('p', { class: 'kh-eyebrow', text: 'KLARHED · 8 kapitler · baseline + slutmåling' }),
      h('h1', { class: 'kh-h1' }, [
        document.createTextNode('Fra indsigt til '),
        h('em', { text: 'integreret' }),
        document.createTextNode(' lederskab.')
      ]),
      h('p', { class: 'kh-lead', text: COURSE.description || COURSE.tagline || '' }),

      state.baseline && Object.keys(state.baseline).length
        ? BaselineSummary()
        : BaselineCTA(),

      h('h2', { class: 'kh-h2', text: 'Kapitler' }),
      ChapterGrid()
    ]);
    return wrap;
  }

  function BaselineCTA() {
    return h('div', { class: 'kh-card kh-card--accent' }, [
      h('div', null, [
        h('p', { class: 'kh-eyebrow', text: 'Start her · 10 min' }),
        h('h3', { class: 'kh-h3', text: 'Tag din baseline-måling' }),
        h('p', { class: 'kh-muted', text: 'Før vi dykker ned i KLARHED-modellen, skal vi vide, hvor du står. Vær ærlig. Der er ingen rigtige eller forkerte svar.' })
      ]),
      h('button', { class: 'kh-btn kh-btn--lime', onclick: function () { go({ view: 'baseline' }); } }, ['Start baseline →'])
    ]);
  }

  function BaselineSummary() {
    var groups = (COURSE.baseline && COURSE.baseline.groups) || [];
    return h('div', { class: 'kh-card' }, [
      h('div', { class: 'kh-card-head' }, [
        h('div', null, [
          h('p', { class: 'kh-eyebrow', text: 'Baseline-måling' }),
          h('h3', { class: 'kh-h3', text: 'Din MQ-score på 7 områder' })
        ]),
        h('button', { class: 'kh-btn kh-btn--ghost', onclick: function () { go({ view: 'baseline' }); } }, ['Gensé / rediger'])
      ]),
      h('div', { class: 'kh-mq-grid' },
        groups.map(function (g) {
          var vals = (g.items || []).map(function (_, i) { return Number(state.baseline[g.letter + ':' + i]) || 0; }).filter(function (v) { return v > 0; });
          var avg = vals.length ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : 0;
          return h('div', { class: 'kh-mq-row' }, [
            h('span', { class: 'kh-mq-letter', text: g.letter }),
            h('span', { class: 'kh-mq-name', text: g.name }),
            h('div', { class: 'kh-mq-bar' }, [
              h('div', { class: 'kh-mq-fill', style: 'width:' + (avg / 5 * 100) + '%' })
            ]),
            h('span', { class: 'kh-mq-num', text: avg ? avg.toFixed(1) : '—' })
          ]);
        })
      )
    ]);
  }

  function ChapterGrid() {
    return h('div', { class: 'kh-chapter-grid' },
      (COURSE.chapters || []).map(function (ch, idx) {
        var lessons = ch.lessons || [];
        var done = lessons.filter(function (_, i) { return state.progress[ch.slug + ':' + i]; }).length;
        var p = lessons.length ? Math.round(done / lessons.length * 100) : 0;
        return h('button', {
          class: 'kh-chapter-card',
          onclick: function () { go({ view: 'chapter', idx: idx }); }
        }, [
          h('div', { class: 'kh-chapter-letter', text: ch.letter }),
          h('div', { class: 'kh-chapter-body' }, [
            h('p', { class: 'kh-eyebrow', text: 'Kapitel ' + ch.n + ' · ' + (ch.duration || '') }),
            h('h3', { class: 'kh-chapter-title', text: ch.name }),
            h('p', { class: 'kh-chapter-summary', text: ch.summary || '' }),
            h('div', { class: 'kh-chapter-progress' }, [
              h('div', { class: 'kh-mini-bar' }, [h('div', { class: 'kh-mini-fill', style: 'width:' + p + '%' })]),
              h('span', { class: 'kh-mini-num', text: done + '/' + lessons.length })
            ])
          ])
        ]);
      })
    );
  }

  function BaselineView() {
    var groups = (COURSE.baseline && COURSE.baseline.groups) || [];
    return h('div', { class: 'kh-container' }, [
      h('button', { class: 'kh-back', onclick: function () { go({ view: 'home' }); } }, ['← Dashboard']),
      h('p', { class: 'kh-eyebrow', text: 'Baseline-måling · 21 udsagn · 10 min' }),
      h('h1', { class: 'kh-h1', text: 'Hvor står du lige nu?' }),
      h('p', { class: 'kh-lead', text: (COURSE.baseline && COURSE.baseline.intro) || '' }),
      h('p', { class: 'kh-muted', text: (COURSE.baseline && COURSE.baseline.scale) || '' }),
      h('div', { class: 'kh-baseline' },
        groups.map(function (g) {
          return h('section', { class: 'kh-baseline-group' }, [
            h('h3', { class: 'kh-baseline-letter' }, [
              h('span', { class: 'kh-baseline-letter-big', text: g.letter }),
              h('span', { class: 'kh-baseline-name', text: g.name })
            ]),
            h('div', { class: 'kh-baseline-items' },
              (g.items || []).map(function (item, i) {
                var key = g.letter + ':' + i;
                return h('div', { class: 'kh-baseline-item' }, [
                  h('p', { class: 'kh-baseline-text', text: item }),
                  h('div', { class: 'kh-scale' },
                    [1, 2, 3, 4, 5].map(function (n) {
                      return h('button', {
                        class: 'kh-scale-btn' + (Number(state.baseline[key]) === n ? ' is-active' : ''),
                        onclick: function () { state.baseline[key] = n; scheduleSync(); renderAll(); }
                      }, [String(n)]);
                    })
                  )
                ]);
              })
            )
          ]);
        })
      ),
      h('div', { class: 'kh-baseline-footer' }, [
        h('button', { class: 'kh-btn kh-btn--lime', onclick: function () { go({ view: 'home' }); } }, ['Gem og fortsæt →'])
      ])
    ]);
  }

  function ChapterView() {
    var idx = route.idx | 0;
    var ch = (COURSE.chapters || [])[idx];
    if (!ch) return h('div', { class: 'kh-container' }, [h('p', { text: 'Kapitel ikke fundet.' })]);

    return h('div', { class: 'kh-container' }, [
      h('button', { class: 'kh-back', onclick: function () { go({ view: 'home' }); } }, ['← Dashboard']),
      h('p', { class: 'kh-eyebrow', text: 'Kapitel ' + ch.n + ' · ' + (ch.duration || '') }),
      h('h1', { class: 'kh-h1' }, [
        h('span', { class: 'kh-big-letter', text: ch.letter }),
        document.createTextNode(' ' + ch.name)
      ]),
      h('p', { class: 'kh-lead', text: ch.summary || '' }),

      h('div', { class: 'kh-lessons' },
        (ch.lessons || []).map(function (les, i) { return LessonCard(ch, i, les); })
      ),

      h('div', { class: 'kh-chapter-nav' }, [
        idx > 0 ? h('button', { class: 'kh-btn kh-btn--ghost', onclick: function () { go({ view: 'chapter', idx: idx - 1 }); } }, ['← Forrige kapitel']) : h('span'),
        idx < COURSE.chapters.length - 1 ? h('button', { class: 'kh-btn kh-btn--lime', onclick: function () { go({ view: 'chapter', idx: idx + 1 }); } }, ['Næste kapitel →']) : null
      ])
    ]);
  }

  function LessonCard(ch, i, les) {
    var pKey = ch.slug + ':' + i;
    var done = !!state.progress[pKey];
    var kind = les.kind || 'read';

    var body;
    switch (kind) {
      case 'case':
        body = h('div', { class: 'kh-lesson-body kh-lesson-body--case' }, [
          h('p', { class: 'kh-case-quote', text: les.body || '' })
        ]); break;
      case 'reflect':
        body = h('div', { class: 'kh-lesson-body' }, (les.prompts || []).map(function (p, pi) {
          var key = ch.slug + ':reflect:' + i + ':' + pi;
          return h('div', { class: 'kh-reflect' }, [
            h('label', { class: 'kh-reflect-q', text: p }),
            textarea(key)
          ]);
        })); break;
      case 'exercise-two-col':
        body = h('div', { class: 'kh-lesson-body' }, [
          les.intro ? h('p', { class: 'kh-muted', text: les.intro }) : null,
          h('div', { class: 'kh-two-col' }, [
            h('div', null, [h('label', { class: 'kh-col-label', text: les.left || '' }), textarea(ch.slug + ':two:' + i + ':L', 6)]),
            h('div', null, [h('label', { class: 'kh-col-label', text: les.right || '' }), textarea(ch.slug + ':two:' + i + ':R', 6)])
          ])
        ]); break;
      case 'exercise':
      case 'exercise-list':
        body = h('div', { class: 'kh-lesson-body' }, [
          les.intro ? h('p', { class: 'kh-muted', text: les.intro }) : null,
          textarea(ch.slug + ':ex:' + i, 6)
        ]); break;
      default:
        body = h('div', { class: 'kh-lesson-body' }, [
          h('div', { class: 'kh-prose', text: les.body || '' })
        ]);
    }

    return h('article', { class: 'kh-lesson' + (done ? ' is-done' : '') }, [
      h('header', { class: 'kh-lesson-head' }, [
        h('span', { class: 'kh-lesson-kind', text: kindLabel(kind) }),
        h('h3', { class: 'kh-lesson-title', text: les.title || '' }),
        h('button', {
          class: 'kh-check' + (done ? ' is-done' : ''),
          onclick: function () {
            state.progress[pKey] = !done;
            scheduleSync(); renderAll();
          }
        }, [done ? '✓ Gennemført' : 'Markér som gennemført'])
      ]),
      body
    ]);
  }

  function textarea(key, rows) {
    var t = h('textarea', { class: 'kh-textarea', rows: rows || 4, placeholder: 'Skriv her…' });
    t.value = state.fields[key] || '';
    t.addEventListener('input', function () { state.fields[key] = t.value; scheduleSync(); });
    return t;
  }

  function kindLabel(k) {
    return { read: 'Læs', case: 'Case', reflect: 'Refleksion', 'exercise-two-col': 'Øvelse', exercise: 'Øvelse', 'exercise-list': 'Øvelse' }[k] || 'Læs';
  }

  // ---------- render ----------
  function renderAll() {
    document.querySelectorAll('#klarhed-root').forEach(function (root) {
      root.innerHTML = '';
      root.className = 'kh-root';
      root.appendChild(Header());
      if (route.view === 'baseline')      root.appendChild(BaselineView());
      else if (route.view === 'chapter')  root.appendChild(ChapterView());
      else                                root.appendChild(Dashboard());
    });
  }

  // ---------- boot ----------
  function boot() {
    if (!document.querySelector('#klarhed-root')) return;
    loadRemote(function () { renderAll(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
