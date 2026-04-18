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
  var expandedBlocks = {};

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

  function loadCourse(done) {
    if (!BOOT.restUrl || (COURSE.chapters && COURSE.chapters.length)) return done();
    fetch(BOOT.restUrl + 'course')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && Array.isArray(d.chapters) && d.chapters.length) {
          COURSE = d;
        }
        done();
      }).catch(done);
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

      (function () {
        var allDone = (ch.lessons || []).length > 0 &&
          (ch.lessons || []).every(function (_, li) { return !!state.progress[ch.slug + ':' + li]; });
        if (!allDone) return null;
        return h('div', { class: 'kh-chapter-done' }, [
          h('p', { class: 'kh-chapter-done-icon', text: '\u2736' }),
          h('h2', { class: 'kh-chapter-done-title', text: 'Kapitel gennemf\u00f8rt' }),
          h('p', { class: 'kh-chapter-done-sub', text: 'Godt arbejde. Du kan altid vende tilbage og tilpasse dine svar.' }),
          idx < COURSE.chapters.length - 1
            ? h('button', { class: 'kh-btn kh-btn--lime', onclick: function () { go({ view: 'chapter', idx: idx + 1 }); } }, ['Forts\u00e6t til n\u00e6ste kapitel \u2192'])
            : null
        ]);
      })(),
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
      case 'quote':
        body = h('div', { class: 'kh-lesson-body' }, [
          h('blockquote', { class: 'kh-quote-block' }, [
            h('p', { class: 'kh-quote-text', text: '\u201C' + (les.body || '') + '\u201D' }),
            les.author ? h('footer', { class: 'kh-quote-author', text: '— ' + les.author }) : null
          ])
        ]); break;
      case 'theory': {
        var thText = les.body || '';
        var thExp = !!expandedBlocks[pKey];
        var thMore = thText.length > 320;
        var thDisplay = (!thMore || thExp) ? thText : thText.slice(0, 280).replace(/\s+$/, '') + '\u2026';
        body = h('div', { class: 'kh-lesson-body' }, [
          h('div', { class: 'kh-prose kh-prose--theory', text: thDisplay }),
          thMore ? h('button', { class: 'kh-expand-btn', onclick: (function (k, e) {
            return function () { expandedBlocks[k] = !e; renderAll(); };
          })(pKey, thExp) }, [thExp ? '\u2191 Vis mindre' : 'L\u00e6s videre \u2192']) : null
        ]); break;
      }
      case 'pillars':
        body = h('div', { class: 'kh-lesson-body' }, [
          h('div', { class: 'kh-pillars' },
            (les.items || []).map(function (pillar) {
              return h('div', { class: 'kh-pillar' }, [
                h('h4', { class: 'kh-pillar-h', text: pillar.h || '' }),
                h('p', { class: 'kh-pillar-p', text: pillar.p || '' })
              ]);
            })
          )
        ]); break;
      case 'dialogue':
        body = h('div', { class: 'kh-lesson-body' }, [
          les.intro ? h('p', { class: 'kh-dialogue-intro', text: les.intro }) : null,
          h('ol', { class: 'kh-dialogue-list' },
            (les.items || []).map(function (item) {
              return h('li', { class: 'kh-dialogue-item', text: item });
            })
          )
        ]); break;
      case 'selfeval':
        body = h('div', { class: 'kh-lesson-body' }, [
          h('p', { class: 'kh-muted', text: '1 = Passer slet ikke · 5 = Passer helt præcist' }),
          h('div', { class: 'kh-selfeval-items' },
            (les.items || []).map(function (item, pi) {
              var key = ch.slug + ':selfeval:' + i + ':' + pi;
              return h('div', { class: 'kh-selfeval-item' }, [
                h('p', { class: 'kh-baseline-text', text: item }),
                h('div', { class: 'kh-scale' },
                  [1, 2, 3, 4, 5].map(function (n) {
                    return h('button', {
                      class: 'kh-scale-btn' + (Number(state.fields[key]) === n ? ' is-active' : ''),
                      onclick: function () { state.fields[key] = n; scheduleSync(); renderAll(); }
                    }, [String(n)]);
                  })
                )
              ]);
            })
          )
        ]); break;
      case 'selvom-saa':
        body = h('div', { class: 'kh-lesson-body' }, [
          les.intro ? h('p', { class: 'kh-muted', text: les.intro }) : null,
          textarea(ch.slug + ':selvom:' + i, 3)
        ]); break;
      case 'commit':
        var commitLabels = ['Indsigt', 'Handling', 'Løfte'];
        body = h('div', { class: 'kh-lesson-body' },
          commitLabels.map(function (label, ci) {
            var key = ch.slug + ':commit:' + i + ':' + ci;
            return h('div', { class: 'kh-reflect' }, [
              h('label', { class: 'kh-reflect-q', text: label }),
              textarea(key, 3)
            ]);
          })
        ); break;
      case 'final-measure':
        var fmGroups = (COURSE.baseline && COURSE.baseline.groups) || [];
        body = h('div', { class: 'kh-lesson-body' }, [
          h('p', { class: 'kh-muted', text: '1 = Passer slet ikke · 5 = Passer helt præcist' }),
          h('div', { class: 'kh-baseline kh-baseline--inline' },
            fmGroups.map(function (g) {
              return h('div', { class: 'kh-baseline-group' }, [
                h('h3', { class: 'kh-baseline-letter' }, [
                  h('span', { class: 'kh-baseline-letter-big', text: g.letter }),
                  h('span', { class: 'kh-baseline-name', text: g.name })
                ]),
                h('div', { class: 'kh-baseline-items' },
                  (g.items || []).map(function (item, gi) {
                    var key = g.letter + ':' + gi;
                    return h('div', { class: 'kh-baseline-item' }, [
                      h('p', { class: 'kh-baseline-text', text: item }),
                      h('div', { class: 'kh-scale' },
                        [1, 2, 3, 4, 5].map(function (n) {
                          return h('button', {
                            class: 'kh-scale-btn' + (Number(state.finalMeasure[key]) === n ? ' is-active' : ''),
                            onclick: function () { state.finalMeasure[key] = n; scheduleSync(); renderAll(); }
                          }, [String(n)]);
                        })
                      )
                    ]);
                  })
                )
              ]);
            })
          )
        ]); break;
      case 'compare':
        var cGroups = (COURSE.baseline && COURSE.baseline.groups) || [];
        body = h('div', { class: 'kh-lesson-body' }, [
          h('div', { class: 'kh-compare-grid' },
            cGroups.map(function (g) {
              var bVals = (g.items || []).map(function (_, gi) { return Number(state.baseline[g.letter + ':' + gi]) || 0; });
              var fVals = (g.items || []).map(function (_, gi) { return Number(state.finalMeasure[g.letter + ':' + gi]) || 0; });
              var bAvg = bVals.length ? bVals.reduce(function (a, b) { return a + b; }, 0) / bVals.length : 0;
              var fAvg = fVals.length ? fVals.reduce(function (a, b) { return a + b; }, 0) / fVals.length : 0;
              var diff = fAvg - bAvg;
              return h('div', { class: 'kh-compare-row' }, [
                h('span', { class: 'kh-mq-letter', text: g.letter }),
                h('span', { class: 'kh-mq-name', text: g.name }),
                h('div', { class: 'kh-compare-bars' }, [
                  h('div', { class: 'kh-compare-bar kh-compare-bar--before', style: 'width:' + (bAvg / 5 * 100) + '%' }),
                  h('div', { class: 'kh-compare-bar kh-compare-bar--after', style: 'width:' + (fAvg / 5 * 100) + '%' })
                ]),
                h('span', {
                  class: 'kh-compare-diff' + (diff > 0 ? ' is-pos' : diff < 0 ? ' is-neg' : ''),
                  text: bAvg && fAvg ? (diff > 0 ? '+' : '') + diff.toFixed(1) : '—'
                })
              ]);
            })
          )
        ]); break;
      case 'plan90':
        body = h('div', { class: 'kh-lesson-body' },
          [1, 2, 3].map(function (n) {
            return h('div', { class: 'kh-reflect' }, [
              h('label', { class: 'kh-reflect-q', text: 'Prioritet ' + n + ': Fokusområde' }),
              textarea(ch.slug + ':plan90:' + i + ':' + n, 3)
            ]);
          })
        ); break;
      case 'manifest':
        body = h('div', { class: 'kh-lesson-body' }, [
          h('p', { class: 'kh-muted', text: 'Skriv dit personlige ledelsesmanifest — de principper og forpligtelser, du tager med dig herfra.' }),
          textarea(ch.slug + ':manifest:' + i, 10)
        ]); break;
      case 'read': {
        var readText = les.body || '';
        var readExp = !!expandedBlocks[pKey];
        var readBreak = readText.indexOf('\n', 200);
        var readCut = readBreak > 0 && readBreak < 500 ? readBreak : 280;
        var readMore = readText.length > readCut + 50;
        var readDisplay = (!readMore || readExp) ? readText : readText.slice(0, readCut).replace(/\s+$/, '') + '\u2026';
        body = h('div', { class: 'kh-lesson-body' }, [
          h('div', { class: 'kh-prose', text: readDisplay }),
          readMore ? h('button', { class: 'kh-expand-btn', onclick: (function (k, e) {
            return function () { expandedBlocks[k] = !e; renderAll(); };
          })(pKey, readExp) }, [readExp ? '\u2191 Vis mindre' : 'L\u00e6s videre \u2192']) : null
        ]); break;
      }
      default:
        body = h('div', { class: 'kh-lesson-body' }, [
          h('div', { class: 'kh-prose', text: les.body || '' })
        ]);
    }

    return h('article', { class: 'kh-lesson kh-lesson--' + kind + (done ? ' is-done' : '') }, [
      h('header', { class: 'kh-lesson-head' }, [
        h('span', { class: 'kh-lesson-kind', text: kindLabel(kind) }),
        h('h3', { class: 'kh-lesson-title', text: les.title || '' }),
        h('button', {
          class: 'kh-check' + (done ? ' is-done' : ''),
          onclick: function () {
            var becomingDone = !done;
            state.progress[pKey] = becomingDone;
            scheduleSync(); renderAll();
            if (becomingDone) {
              setTimeout(function () {
                var all = document.querySelectorAll('#klarhed-root .kh-lesson');
                if (all[i + 1]) { all[i + 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); }
              }, 60);
            }
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
    return {
      read: 'Læs', case: 'Case', reflect: 'Refleksion',
      'exercise-two-col': 'Øvelse', exercise: 'Øvelse', 'exercise-list': 'Øvelse',
      'selvom-saa': 'Øvelse', quote: 'Citat', theory: 'Teori',
      pillars: 'Nøglepunkter', dialogue: 'Dialogværktøj',
      selfeval: 'Selvevaluering', commit: 'Indsigt · Handling · Løfte',
      'final-measure': 'Slutmåling', compare: 'Sammenligning',
      plan90: '90-dages plan', manifest: 'Manifest'
    }[k] || 'Læs';
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
    loadCourse(function () { loadRemote(function () { renderAll(); }); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
