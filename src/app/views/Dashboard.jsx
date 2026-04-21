import { useState } from '@wordpress/element';

export function Dashboard( { course, snapshot, store, go, user } ) {
    const chapters    = course?.chapters || [];
    const active      = snapshot.attempts.find( ( a ) => a.id === snapshot.activeId );
    const progress    = active?.progress || {};
    const fields      = active?.fields   || {};
    const share       = snapshot.share;
    const hasBaseline = Object.keys( active?.baseline || {} ).length > 0;
    const welcomed    = !! fields[ 'welcome:challenge' ];

    const dayNum = active?.createdAt
        ? Math.max( 1, Math.floor( ( Date.now() - new Date( active.createdAt ) ) / 86400000 ) + 1 )
        : null;

    const eyebrow = [
        user   ? `Hej ${ user }`      : 'KLARHED',
        dayNum ? `Dag ${ dayNum }`     : `${ chapters.length } kapitler`,
        dayNum ? `${ chapters.length } kapitler` : 'baseline + slutmåling',
    ].join( ' · ' );

    const next = findNextLesson( chapters, progress );

    return (
        <>
            <div className="kh-hero">
                <div className="kh-hero-inner">
                    <p className="kh-eyebrow">{ eyebrow }</p>
                    <h1 className="kh-h1">Fra indsigt til <em>integreret</em> lederskab.</h1>
                    { ( course?.description || course?.tagline ) && (
                        <p className="kh-lead">{ course.description || course.tagline }</p>
                    ) }
                </div>
            </div>

            <main className="kh-container kh-container--slim-top">

                { ! welcomed && (
                    <WelcomeCard user={ user } store={ store } />
                ) }

                <AttemptName active={ active } store={ store } />

                { hasBaseline
                    ? <BaselineSummary groups={ course?.baseline?.groups || [] } baseline={ active.baseline } go={ go } />
                    : <BaselineCTA go={ go } /> }

                { hasBaseline && next && (
                    <NextLesson next={ next } go={ go } />
                ) }

                <h2 className="kh-h2">Kapitler</h2>
                <div className="kh-chapter-grid">
                    { chapters.map( ( ch, idx ) => (
                        <ChapterCard key={ ch.slug } ch={ ch } idx={ idx } progress={ progress } go={ go } />
                    ) ) }
                </div>

                { hasBaseline && (
                    <div className="kh-dashboard-actions">
                        <button className="kh-btn kh-btn--ghost" onClick={ () => go( { view: 'compare' } ) }>
                            Se din transformation →
                        </button>
                    </div>
                ) }

                { share?.adminAllowed && (
                    <ShareCard share={ share } store={ store } />
                ) }

            </main>
        </>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function findNextLesson( chapters, progress ) {
    for ( let ci = 0; ci < chapters.length; ci++ ) {
        const ch = chapters[ ci ];
        for ( let li = 0; li < ( ch.lessons || [] ).length; li++ ) {
            if ( ! progress[ `${ ch.slug }:${ li }` ] ) {
                return { chapter: ch, chapterIdx: ci, lesson: ch.lessons[ li ] };
            }
        }
    }
    return null;
}

// ── Attempt rename ────────────────────────────────────────────────────────

function AttemptName( { active, store } ) {
    const [ editing, setEditing ] = useState( false );
    const [ val, setVal ]         = useState( '' );

    if ( ! active ) return null;

    const startEdit = () => { setVal( active.name || '' ); setEditing( true ); };
    const commit    = () => {
        setEditing( false );
        const trimmed = val.trim();
        if ( trimmed && trimmed !== active.name ) store.rename( active.id, trimmed );
    };

    return (
        <div className="kh-attempt-name">
            { editing ? (
                <input
                    className="kh-attempt-name-input"
                    value={ val }
                    autoFocus
                    onChange={ ( e ) => setVal( e.target.value ) }
                    onBlur={ commit }
                    onKeyDown={ ( e ) => { if ( e.key === 'Enter' ) commit(); if ( e.key === 'Escape' ) setEditing( false ); } }
                />
            ) : (
                <>
                    <span className="kh-attempt-name-label">{ active.name || 'Mit forløb' }</span>
                    <button className="kh-attempt-name-edit" onClick={ startEdit } title="Omdøb forløbet">✏</button>
                </>
            ) }
        </div>
    );
}

// ── Welcome card — shows once until answered ──────────────────────────────

function WelcomeCard( { user, store } ) {
    const [ val, setVal ]           = useState( '' );
    const [ submitted, setSubmitted ] = useState( false );

    if ( submitted ) return null;

    const handleSubmit = () => {
        if ( ! val.trim() ) return;
        setSubmitted( true );
        store.saveAnswers( { fields: { 'welcome:challenge': val.trim() } } );
    };

    return (
        <div className="kh-welcome-card">
            <p className="kh-eyebrow">Inden vi starter</p>
            <h3 className="kh-h3">{ user ? `Hej ${ user }` : 'Hej' } — ét spørgsmål til dig:</h3>
            <label className="kh-reflect-q kh-welcome-q">
                Hvad er din vigtigste udfordring som leder lige nu?
            </label>
            <textarea
                className="kh-textarea"
                value={ val }
                rows={ 3 }
                placeholder="Skriv her…"
                onChange={ ( e ) => setVal( e.target.value ) }
            />
            <div className="kh-welcome-footer">
                <button
                    className="kh-btn kh-btn--lime"
                    disabled={ ! val.trim() }
                    onClick={ handleSubmit }
                >
                    Gem og start forløbet →
                </button>
                <button className="kh-welcome-skip" onClick={ () => setSubmitted( true ) }>
                    Spring over
                </button>
            </div>
        </div>
    );
}

// ── Baseline CTA ──────────────────────────────────────────────────────────

function BaselineCTA( { go } ) {
    return (
        <div className="kh-card kh-card--accent">
            <div>
                <p className="kh-eyebrow">Inden vi starter · 10 min</p>
                <h3 className="kh-h3">Find dit udgangspunkt</h3>
                <p className="kh-muted">Det er det, der gør din transformation synlig. Ærlige svar — der er ingen rigtige eller forkerte.</p>
            </div>
            <button className="kh-btn kh-btn--lime" onClick={ () => go( { view: 'baseline' } ) }>
                Find mit udgangspunkt →
            </button>
        </div>
    );
}

// ── Baseline summary ──────────────────────────────────────────────────────

function BaselineSummary( { groups, baseline, go } ) {
    const rowAvgs = groups.map( ( g ) => {
        const vals = ( g.items || [] ).map( ( _, i ) => Number( baseline[ `${ g.letter }:${ i }` ] ) || 0 );
        return vals.length ? vals.reduce( ( a, b ) => a + b, 0 ) / vals.length : 0;
    } );
    const filledAvgs = rowAvgs.filter( ( v ) => v > 0 );
    const totalMQ    = filledAvgs.length ? filledAvgs.reduce( ( a, b ) => a + b, 0 ) / filledAvgs.length : 0;
    const interpretation = totalMQ < 2 ? 'Dit udgangspunkt er kortlagt'
        : totalMQ < 3 ? 'Du har et fundament at bygge på'
        : totalMQ < 4 ? 'Du er stærkt positioneret'
        : 'Fremragende udgangspunkt';

    return (
        <div className="kh-card">
            <div className="kh-card-head">
                <div>
                    <p className="kh-eyebrow">Baseline-måling</p>
                    <h3 className="kh-h3">Din MQ-score på { groups.length } områder</h3>
                </div>
                <button className="kh-btn kh-btn--ghost" onClick={ () => go( { view: 'baseline' } ) }>
                    Gensé / rediger
                </button>
            </div>
            <div className="kh-mq-grid">
                { groups.map( ( g, gi ) => (
                    <div key={ g.letter } className="kh-mq-row">
                        <span className="kh-mq-letter">{ g.letter }</span>
                        <span className="kh-mq-name">{ g.name }</span>
                        <div className="kh-mq-bar">
                            <div className="kh-mq-fill" style={ { width: `${ rowAvgs[ gi ] / 5 * 100 }%` } } />
                        </div>
                        <span className="kh-mq-num">{ rowAvgs[ gi ] ? rowAvgs[ gi ].toFixed( 1 ) : '—' }</span>
                    </div>
                ) ) }
            </div>
            { totalMQ > 0 && (
                <div className="kh-mq-total">
                    <span className="kh-mq-total-score">{ totalMQ.toFixed( 1 ) }</span>
                    <div>
                        <p className="kh-eyebrow">Samlet MQ</p>
                        <p className="kh-mq-total-label">{ interpretation }</p>
                    </div>
                </div>
            ) }
        </div>
    );
}

// ── Next lesson widget ────────────────────────────────────────────────────

function NextLesson( { next, go } ) {
    return (
        <button
            className="kh-next-lesson"
            onClick={ () => go( { view: 'chapter', idx: next.chapterIdx } ) }
        >
            <div className="kh-next-lesson-meta">
                <p className="kh-eyebrow">Fortsæt her</p>
                <p className="kh-next-chapter">{ next.chapter.letter } · { next.chapter.name }</p>
            </div>
            <div className="kh-next-lesson-body">
                <h3 className="kh-next-title">{ next.lesson.title }</h3>
            </div>
            <span className="kh-next-arrow">→</span>
        </button>
    );
}

// ── Chapter card ──────────────────────────────────────────────────────────

function ChapterCard( { ch, idx, progress, go } ) {
    const lessons    = ch.lessons || [];
    const done       = lessons.filter( ( _, i ) => progress[ `${ ch.slug }:${ i }` ] ).length;
    const pct        = lessons.length ? Math.round( done / lessons.length * 100 ) : 0;
    const isComplete = lessons.length > 0 && done === lessons.length;

    return (
        <button
            className={ `kh-chapter-card${ isComplete ? ' is-complete' : '' }` }
            onClick={ () => go( { view: 'chapter', idx } ) }
        >
            <div className="kh-chapter-letter">{ ch.letter }</div>
            <div className="kh-chapter-body">
                <p className="kh-eyebrow">Kapitel { ch.n } · { ch.duration || '' }</p>
                <h3 className="kh-chapter-title">{ ch.name }</h3>
                <p className="kh-chapter-summary">{ ch.summary || '' }</p>
                <div className="kh-chapter-progress">
                    <div className="kh-mini-bar">
                        <div className="kh-mini-fill" style={ { width: `${ pct }%` } } />
                    </div>
                    <span className="kh-mini-num">{ done }/{ lessons.length }</span>
                </div>
            </div>
        </button>
    );
}

// ── Coach-share card ──────────────────────────────────────────────────────

function ShareCard( { share, store } ) {
    const [ busy, setBusy ] = useState( false );

    const toggle = async () => {
        setBusy( true );
        await store.updateShare( { enabled: ! share.enabled } ).catch( () => {} );
        setBusy( false );
    };

    const copyLink = () => {
        if ( share.publicUrl ) navigator.clipboard?.writeText( share.publicUrl ).catch( () => {} );
    };

    return (
        <div className="kh-share-card">
            <p className="kh-eyebrow">Coach-adgang</p>
            <div className="kh-share-row">
                <div>
                    <h3 className="kh-h3">Del med din coach</h3>
                    <p className="kh-muted">Din coach kan se dine svar og fremgang — du bevarer fuld kontrol.</p>
                </div>
                <button
                    className={ `kh-toggle${ share.enabled ? ' is-on' : '' }` }
                    onClick={ toggle }
                    disabled={ busy }
                    aria-pressed={ share.enabled }
                >
                    <span className="kh-toggle-knob" />
                </button>
            </div>
            { share.enabled && share.publicUrl && (
                <div className="kh-share-link">
                    <p className="kh-muted" style={ { marginBottom: 8 } }>Del dette link med din coach:</p>
                    <div className="kh-share-link-row">
                        <input className="kh-share-url" readOnly value={ share.publicUrl } onClick={ ( e ) => e.target.select() } />
                        <button className="kh-btn kh-btn--ghost" onClick={ copyLink }>Kopier</button>
                    </div>
                </div>
            ) }
        </div>
    );
}
