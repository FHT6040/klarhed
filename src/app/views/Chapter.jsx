import { useState, useCallback, useRef, useEffect } from '@wordpress/element';

const KIND_LABELS = {
    read: 'Læs', case: 'Case', reflect: 'Refleksion',
    'exercise-two-col': 'Øvelse', exercise: 'Øvelse', 'exercise-list': 'Øvelse',
    'selvom-saa': 'Øvelse', quote: 'Citat', theory: 'Teori',
    pillars: 'Nøglepunkter', dialogue: 'Dialogværktøj',
    selfeval: 'Selvevaluering', commit: 'Indsigt · Handling · Løfte',
    'final-measure': 'Slutmåling', compare: 'Sammenligning',
    plan90: '90-dages plan', manifest: 'Manifest',
};

export function Chapter( { course, snapshot, store, go, idx } ) {
    const chapters       = course?.chapters || [];
    const ch             = chapters[ idx | 0 ];
    const active         = snapshot.attempts.find( ( a ) => a.id === snapshot.activeId );
    const progress       = active?.progress     || {};
    const fields         = active?.fields       || {};
    const baseline       = active?.baseline     || {};
    const finalMeasure   = active?.finalMeasure || {};
    const baselineGroups = course?.baseline?.groups || [];

    const [ focusMode, setFocusMode ] = useState( null ); // { key, prompt }

    const save = useCallback( ( patch ) => store.saveAnswers( patch ), [ store ] );

    const markDone = useCallback( ( pKey, isDone ) => {
        save( { progress: { [ pKey ]: isDone } } );
        if ( isDone ) {
            setTimeout( () => {
                const all = document.querySelectorAll( '#klarhed-root .kh-lesson' );
                const i   = parseInt( pKey.split( ':' )[ 1 ], 10 );
                if ( all[ i + 1 ] ) all[ i + 1 ].scrollIntoView( { behavior: 'smooth', block: 'start' } );
            }, 60 );
        }
    }, [ save ] );

    if ( ! ch ) return <div className="kh-container"><p>Kapitel ikke fundet.</p></div>;

    const lessons = ch.lessons || [];
    const allDone = lessons.length > 0 && lessons.every( ( _, i ) => !! progress[ `${ ch.slug }:${ i }` ] );

    return (
        <main className="kh-container">
            { focusMode && (
                <FocusOverlay
                    focusMode={ focusMode }
                    value={ fields[ focusMode.key ] || '' }
                    onChange={ ( v ) => save( { fields: { [ focusMode.key ]: v } } ) }
                    onClose={ () => setFocusMode( null ) }
                />
            ) }

            <button className="kh-back" onClick={ () => go( { view: 'home' } ) }>← Dashboard</button>
            <p className="kh-eyebrow">Kapitel { ch.n } · { ch.duration || '' }</p>
            <h1 className="kh-h1">
                <span className="kh-big-letter">{ ch.letter }</span> { ch.name }
            </h1>
            { ch.summary && <p className="kh-lead">{ ch.summary }</p> }

            <BaselineRef ch={ ch } baseline={ baseline } baselineGroups={ baselineGroups } />

            <div className="kh-lessons">
                { lessons.map( ( les, i ) => {
                    const pKey = `${ ch.slug }:${ i }`;
                    return (
                        <LessonCard
                            key={ pKey }
                            ch={ ch } idx={ i } les={ les } pKey={ pKey }
                            done={ !! progress[ pKey ] }
                            fields={ fields } baseline={ baseline }
                            finalMeasure={ finalMeasure } baselineGroups={ baselineGroups }
                            chapters={ chapters }
                            save={ save } onMarkDone={ markDone } onFocusMode={ setFocusMode }
                        />
                    );
                } ) }
            </div>

            { allDone && (
                <ChapterDone ch={ ch } idx={ idx } chapters={ chapters } lessons={ lessons } go={ go } />
            ) }

            <div className="kh-chapter-nav">
                { idx > 0
                    ? <button className="kh-btn kh-btn--ghost" onClick={ () => go( { view: 'chapter', idx: idx - 1 } ) }>← Forrige modul</button>
                    : <span /> }
                { idx < chapters.length - 1 && (
                    <button className="kh-btn kh-btn--lime" onClick={ () => go( { view: 'chapter', idx: idx + 1 } ) }>
                        Næste modul →
                    </button>
                ) }
            </div>
        </main>
    );
}

// ── Focus mode overlay ────────────────────────────────────────────────────

function FocusOverlay( { focusMode, value, onChange, onClose } ) {
    const textareaRef = useRef( null );
    const [ draft, setDraft ] = useState( value );
    const timerRef = useRef( null );

    useEffect( () => {
        textareaRef.current?.focus();
        const onKey = ( e ) => { if ( e.key === 'Escape' ) handleClose(); };
        document.addEventListener( 'keydown', onKey );
        return () => document.removeEventListener( 'keydown', onKey );
    }, [] );

    const handleClose = () => {
        clearTimeout( timerRef.current );
        if ( draft !== value ) onChange( draft );
        onClose();
    };

    return (
        <div className="kh-focus-overlay" onClick={ ( e ) => { if ( e.target === e.currentTarget ) handleClose(); } }>
            <div className="kh-focus-card">
                { focusMode.prompt && <p className="kh-reflect-q">{ focusMode.prompt }</p> }
                <textarea
                    ref={ textareaRef }
                    className="kh-textarea kh-textarea--focus"
                    value={ draft }
                    placeholder="Skriv her…"
                    rows={ 10 }
                    onChange={ ( e ) => {
                        const v = e.target.value;
                        setDraft( v );
                        clearTimeout( timerRef.current );
                        timerRef.current = setTimeout( () => onChange( v ), 600 );
                    } }
                />
                <div className="kh-focus-footer">
                    <span className="kh-muted">Esc for at lukke</span>
                    <button className="kh-btn kh-btn--lime" onClick={ handleClose }>Gem ✓</button>
                </div>
            </div>
        </div>
    );
}

// ── Baseline reference — shown at top of chapter when baseline is filled ─

function BaselineRef( { ch, baseline, baselineGroups } ) {
    const group = baselineGroups.find( ( g ) => g.letter === ch.letter );
    if ( ! group ) return null;
    const vals = ( group.items || [] ).map( ( _, i ) => Number( baseline[ `${ ch.letter }:${ i }` ] ) || 0 );
    const nonZero = vals.filter( ( v ) => v > 0 );
    if ( ! nonZero.length ) return null;
    const avg = nonZero.reduce( ( a, b ) => a + b, 0 ) / nonZero.length;

    return (
        <div className="kh-chapter-baseline-ref">
            <span className="kh-eyebrow">Dit baseline-udgangspunkt</span>
            <span className="kh-chapter-baseline-score">
                { avg.toFixed( 1 ) }<span>/5</span>
            </span>
            <span className="kh-chapter-baseline-label">på { ch.letter } · { ch.name }</span>
        </div>
    );
}

// ── Chapter completion banner ─────────────────────────────────────────────

function ChapterDone( { ch, idx, chapters, lessons, go } ) {
    const quote = lessons.find( ( l ) => l.kind === 'quote' );
    return (
        <div className="kh-chapter-done">
            <div className="kh-chapter-done-letter">{ ch.letter }</div>
            <h2 className="kh-chapter-done-title">Kapitel gennemført</h2>
            { quote && (
                <blockquote className="kh-chapter-done-quote">
                    <p>"{ quote.body }"</p>
                    { quote.author && <footer>— { quote.author }</footer> }
                </blockquote>
            ) }
            <p className="kh-chapter-done-sub">Godt arbejde. Du kan altid vende tilbage og tilpasse dine svar.</p>
            { idx < chapters.length - 1 && (
                <button className="kh-btn kh-btn--lime" onClick={ () => go( { view: 'chapter', idx: idx + 1 } ) }>
                    Fortsæt til næste modul →
                </button>
            ) }
        </div>
    );
}

// ── Lesson card ──────────────────────────────────────────────────────────

function LessonCard( { ch, idx, les, pKey, done, fields, baseline, finalMeasure, baselineGroups, chapters, save, onMarkDone, onFocusMode } ) {
    const kind = les.kind || 'read';
    const [ expanded, setExpanded ] = useState( false );

    return (
        <article className={ `kh-lesson kh-lesson--${ kind }${ done ? ' is-done' : '' }` }>
            <header className="kh-lesson-head">
                <span className="kh-lesson-kind">{ KIND_LABELS[ kind ] || 'Læs' }</span>
                <h3 className="kh-lesson-title">{ les.title || '' }</h3>
                <button
                    className={ `kh-check${ done ? ' is-done' : '' }` }
                    onClick={ () => onMarkDone( pKey, ! done ) }
                >
                    { done ? '✓ Gennemført' : 'Markér som gennemført' }
                </button>
            </header>
            <LessonBody
                ch={ ch } idx={ idx } les={ les } kind={ kind }
                fields={ fields } baseline={ baseline } finalMeasure={ finalMeasure }
                baselineGroups={ baselineGroups } chapters={ chapters }
                save={ save } onFocusMode={ onFocusMode }
                expanded={ expanded } setExpanded={ setExpanded }
            />
        </article>
    );
}

// ── Lesson body — one component per kind ─────────────────────────────────

function LessonBody( { ch, idx, les, kind, fields, baseline, finalMeasure, baselineGroups, chapters, save, onFocusMode, expanded, setExpanded } ) {
    switch ( kind ) {
        case 'read': {
            const text    = les.body || '';
            const cut     = ( () => { const i = text.indexOf( '\n', 200 ); return i > 0 && i < 500 ? i : 280; } )();
            const hasMore = text.length > cut + 50;
            return (
                <div className="kh-lesson-body">
                    <div className="kh-prose">{ ! hasMore || expanded ? text : text.slice( 0, cut ).trimEnd() + '…' }</div>
                    { hasMore && <button className="kh-expand-btn" onClick={ () => setExpanded( ! expanded ) }>{ expanded ? '↑ Vis mindre' : 'Læs videre →' }</button> }
                </div>
            );
        }
        case 'theory': {
            const text    = les.body || '';
            const hasMore = text.length > 320;
            return (
                <div className="kh-lesson-body">
                    <div className="kh-prose kh-prose--theory">{ ! hasMore || expanded ? text : text.slice( 0, 280 ).trimEnd() + '…' }</div>
                    { hasMore && <button className="kh-expand-btn" onClick={ () => setExpanded( ! expanded ) }>{ expanded ? '↑ Vis mindre' : 'Læs videre →' }</button> }
                </div>
            );
        }
        case 'case':
            return (
                <div className="kh-lesson-body kh-lesson-body--case">
                    <p className="kh-case-quote">{ les.body || '' }</p>
                </div>
            );
        case 'quote':
            return (
                <div className="kh-lesson-body">
                    <blockquote className="kh-quote-block">
                        <p className="kh-quote-text">"{ les.body || '' }"</p>
                        { les.author && <footer className="kh-quote-author">— { les.author }</footer> }
                    </blockquote>
                </div>
            );
        case 'reflect':
            return (
                <div className="kh-lesson-body">
                    { ( les.prompts || [] ).map( ( prompt, pi ) => {
                        const k = `${ ch.slug }:reflect:${ idx }:${ pi }`;
                        return (
                            <div key={ pi } className="kh-reflect">
                                <label className="kh-reflect-q">{ prompt }</label>
                                <Textarea
                                    fieldKey={ k } value={ fields[ k ] || '' } save={ save }
                                    onFocusMode={ () => onFocusMode( { key: k, prompt } ) }
                                />
                            </div>
                        );
                    } ) }
                </div>
            );
        case 'commit': {
            const reflectRefs = ( ch.lessons || [] ).reduce( ( acc, l, li ) => {
                if ( l.kind !== 'reflect' ) return acc;
                ( l.prompts || [] ).forEach( ( prompt, pi ) => {
                    const v = fields[ `${ ch.slug }:reflect:${ li }:${ pi }` ]?.trim();
                    if ( v ) acc.push( { prompt, answer: v } );
                } );
                return acc;
            }, [] );
            return (
                <div className="kh-lesson-body">
                    { reflectRefs.length > 0 && (
                        <div className="kh-commit-refs">
                            <p className="kh-eyebrow">Dine refleksioner i dette kapitel</p>
                            { reflectRefs.map( ( { prompt, answer }, i ) => (
                                <div key={ i } className="kh-commit-ref-item">
                                    <p className="kh-commit-ref-q">{ prompt }</p>
                                    <p className="kh-commit-ref-a">"{ answer }"</p>
                                </div>
                            ) ) }
                        </div>
                    ) }
                    { [ 'Indsigt', 'Handling', 'Løfte' ].map( ( label, ci ) => {
                        const k = `${ ch.slug }:commit:${ idx }:${ ci }`;
                        return (
                            <div key={ ci } className="kh-reflect">
                                <label className="kh-reflect-q">{ label }</label>
                                <Textarea
                                    fieldKey={ k } value={ fields[ k ] || '' } save={ save } rows={ 3 }
                                    onFocusMode={ () => onFocusMode( { key: k, prompt: label } ) }
                                />
                            </div>
                        );
                    } ) }
                </div>
            );
        }
        case 'manifest': {
            const k = `${ ch.slug }:manifest:${ idx }`;
            return (
                <div className="kh-lesson-body">
                    <p className="kh-muted">Skriv dit personlige ledelsesmanifest — de principper og forpligtelser, du tager med dig herfra.</p>
                    <Textarea
                        fieldKey={ k } value={ fields[ k ] || '' } save={ save } rows={ 10 }
                        onFocusMode={ () => onFocusMode( { key: k, prompt: 'Mit ledelsesmanifest' } ) }
                    />
                </div>
            );
        }
        case 'selvom-saa': {
            const k = `${ ch.slug }:selvom:${ idx }`;
            return (
                <div className="kh-lesson-body">
                    { les.intro && <p className="kh-muted">{ les.intro }</p> }
                    <Textarea
                        fieldKey={ k } value={ fields[ k ] || '' } save={ save } rows={ 3 }
                        onFocusMode={ () => onFocusMode( { key: k, prompt: les.intro || '' } ) }
                    />
                </div>
            );
        }
        case 'exercise-two-col': {
            const lKey = `${ ch.slug }:two:${ idx }:L`;
            const rKey = `${ ch.slug }:two:${ idx }:R`;
            return (
                <div className="kh-lesson-body">
                    { les.intro && <p className="kh-muted">{ les.intro }</p> }
                    <div className="kh-two-col">
                        <div>
                            <label className="kh-col-label">{ les.left || '' }</label>
                            <Textarea fieldKey={ lKey } value={ fields[ lKey ] || '' } save={ save } rows={ 6 } />
                        </div>
                        <div>
                            <label className="kh-col-label">{ les.right || '' }</label>
                            <Textarea fieldKey={ rKey } value={ fields[ rKey ] || '' } save={ save } rows={ 6 } />
                        </div>
                    </div>
                </div>
            );
        }
        case 'exercise':
        case 'exercise-list': {
            const k = `${ ch.slug }:ex:${ idx }`;
            return (
                <div className="kh-lesson-body">
                    { les.intro && <p className="kh-muted">{ les.intro }</p> }
                    <Textarea fieldKey={ k } value={ fields[ k ] || '' } save={ save } rows={ 6 } />
                </div>
            );
        }
        case 'pillars':
            return (
                <div className="kh-lesson-body">
                    <div className="kh-pillars">
                        { ( les.items || [] ).map( ( pillar, i ) => (
                            <div key={ i } className="kh-pillar">
                                <h4 className="kh-pillar-h">{ pillar.h || '' }</h4>
                                <p className="kh-pillar-p">{ pillar.p || '' }</p>
                            </div>
                        ) ) }
                    </div>
                </div>
            );
        case 'dialogue':
            return (
                <div className="kh-lesson-body">
                    { les.intro && <p className="kh-dialogue-intro">{ les.intro }</p> }
                    <ol className="kh-dialogue-list">
                        { ( les.items || [] ).map( ( item, i ) => (
                            <li key={ i } className="kh-dialogue-item">{ item }</li>
                        ) ) }
                    </ol>
                </div>
            );
        case 'selfeval':
            return (
                <div className="kh-lesson-body">
                    <p className="kh-muted">1 = Passer slet ikke · 5 = Passer helt præcist</p>
                    <div className="kh-selfeval-items">
                        { ( les.items || [] ).map( ( item, pi ) => {
                            const k = `${ ch.slug }:selfeval:${ idx }:${ pi }`;
                            return (
                                <div key={ pi } className="kh-selfeval-item">
                                    <p className="kh-baseline-text">{ item }</p>
                                    <div className="kh-scale">
                                        { [ 1, 2, 3, 4, 5 ].map( ( n ) => (
                                            <button
                                                key={ n }
                                                className={ `kh-scale-btn${ Number( fields[ k ] ) === n ? ' is-active' : '' }` }
                                                onClick={ () => save( { fields: { [ k ]: n } } ) }
                                            >{ n }</button>
                                        ) ) }
                                    </div>
                                </div>
                            );
                        } ) }
                    </div>
                </div>
            );
        case 'final-measure':
            return (
                <div className="kh-lesson-body">
                    <p className="kh-muted">1 = Passer slet ikke · 5 = Passer helt præcist</p>
                    <div className="kh-baseline kh-baseline--inline">
                        { baselineGroups.map( ( g ) => (
                            <div key={ g.letter } className="kh-baseline-group">
                                <h3 className="kh-baseline-letter">
                                    <span className="kh-baseline-letter-big">{ g.letter }</span>
                                    <span className="kh-baseline-name">{ g.name }</span>
                                </h3>
                                <div className="kh-baseline-items">
                                    { ( g.items || [] ).map( ( item, gi ) => {
                                        const k = `${ g.letter }:${ gi }`;
                                        return (
                                            <div key={ k } className="kh-baseline-item">
                                                <p className="kh-baseline-text">{ item }</p>
                                                <div className="kh-scale">
                                                    { [ 1, 2, 3, 4, 5 ].map( ( n ) => (
                                                        <button
                                                            key={ n }
                                                            className={ `kh-scale-btn${ Number( finalMeasure[ k ] ) === n ? ' is-active' : '' }` }
                                                            onClick={ () => save( { finalMeasure: { [ k ]: n } } ) }
                                                        >{ n }</button>
                                                    ) ) }
                                                </div>
                                            </div>
                                        );
                                    } ) }
                                </div>
                            </div>
                        ) ) }
                    </div>
                </div>
            );
        case 'compare': {
            return (
                <div className="kh-lesson-body">
                    <div className="kh-compare-grid">
                        { baselineGroups.map( ( g ) => {
                            const bVals = ( g.items || [] ).map( ( _, gi ) => Number( baseline[ `${ g.letter }:${ gi }` ] ) || 0 );
                            const fVals = ( g.items || [] ).map( ( _, gi ) => Number( finalMeasure[ `${ g.letter }:${ gi }` ] ) || 0 );
                            const bAvg  = bVals.length ? bVals.reduce( ( a, b ) => a + b, 0 ) / bVals.length : 0;
                            const fAvg  = fVals.length ? fVals.reduce( ( a, b ) => a + b, 0 ) / fVals.length : 0;
                            const diff  = fAvg - bAvg;
                            return (
                                <div key={ g.letter } className="kh-compare-row">
                                    <span className="kh-mq-letter">{ g.letter }</span>
                                    <span className="kh-mq-name">{ g.name }</span>
                                    <div className="kh-compare-bars">
                                        <div className="kh-compare-bar kh-compare-bar--before" style={ { width: `${ bAvg / 5 * 100 }%` } } />
                                        <div className="kh-compare-bar kh-compare-bar--after"  style={ { width: `${ fAvg / 5 * 100 }%` } } />
                                    </div>
                                    <span className={ `kh-compare-diff${ diff > 0 ? ' is-pos' : diff < 0 ? ' is-neg' : '' }` }>
                                        { bAvg && fAvg ? ( diff > 0 ? '+' : '' ) + diff.toFixed( 1 ) : '—' }
                                    </span>
                                </div>
                            );
                        } ) }
                    </div>
                </div>
            );
        }
        case 'plan90': {
            const challenge = fields[ 'welcome:challenge' ]?.trim();
            const commitRefs = ( chapters || [] ).flatMap( ( c ) =>
                ( c.lessons || [] ).reduce( ( acc, l, li ) => {
                    if ( l.kind !== 'commit' ) return acc;
                    const v = fields[ `${ c.slug }:commit:${ li }:0` ]?.trim();
                    if ( v ) acc.push( { letter: c.letter, name: c.name, indsigt: v } );
                    return acc;
                }, [] )
            );
            return (
                <div className="kh-lesson-body">
                    { ( challenge || commitRefs.length > 0 ) && (
                        <div className="kh-plan90-refs">
                            { challenge && (
                                <div className="kh-plan90-challenge">
                                    <p className="kh-eyebrow">Din startudfordring</p>
                                    <p className="kh-plan90-challenge-text">"{ challenge }"</p>
                                </div>
                            ) }
                            { commitRefs.length > 0 && (
                                <>
                                    <p className="kh-eyebrow" style={ { marginTop: challenge ? 16 : 0 } }>Dine vigtigste indsigter</p>
                                    { commitRefs.map( ( { letter, name, indsigt }, i ) => (
                                        <div key={ i } className="kh-plan90-commit-item">
                                            <span className="kh-plan90-commit-letter">{ letter }</span>
                                            <div>
                                                <p className="kh-plan90-commit-name">{ name }</p>
                                                <p className="kh-plan90-commit-text">"{ indsigt }"</p>
                                            </div>
                                        </div>
                                    ) ) }
                                </>
                            ) }
                        </div>
                    ) }
                    { [ 1, 2, 3 ].map( ( n ) => {
                        const k = `${ ch.slug }:plan90:${ idx }:${ n }`;
                        return (
                            <div key={ n } className="kh-reflect">
                                <label className="kh-reflect-q">Prioritet { n }: Fokusområde</label>
                                <Textarea
                                    fieldKey={ k } value={ fields[ k ] || '' } save={ save } rows={ 3 }
                                    onFocusMode={ () => onFocusMode( { key: k, prompt: `Prioritet ${ n }: Fokusområde` } ) }
                                />
                            </div>
                        );
                    } ) }
                </div>
            );
        }
        default:
            return (
                <div className="kh-lesson-body">
                    <div className="kh-prose">{ les.body || '' }</div>
                </div>
            );
    }
}

// ── Textarea with debounced save + optional focus-mode trigger ────────────

function Textarea( { fieldKey, value, save, rows = 4, onFocusMode } ) {
    const [ draft, setDraft ] = useState( value );
    const timerRef = useRef( null );

    // Sync when navigating to a different field
    useEffect( () => { setDraft( value ); }, [ fieldKey ] );

    return (
        <div className="kh-textarea-wrap">
            <textarea
                className="kh-textarea"
                value={ draft }
                rows={ rows }
                placeholder="Skriv her…"
                onChange={ ( e ) => {
                    const v = e.target.value;
                    setDraft( v );
                    clearTimeout( timerRef.current );
                    timerRef.current = setTimeout( () => save( { fields: { [ fieldKey ]: v } } ), 600 );
                } }
            />
            { onFocusMode && (
                <button className="kh-focus-btn" onClick={ onFocusMode } title="Åbn fokustilstand">⤢</button>
            ) }
        </div>
    );
}
