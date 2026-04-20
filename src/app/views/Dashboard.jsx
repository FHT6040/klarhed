export function Dashboard( { course, snapshot, go } ) {
    const chapters   = course?.chapters || [];
    const active     = snapshot.attempts.find( ( a ) => a.id === snapshot.activeId );
    const hasBaseline = Object.keys( active?.baseline || {} ).length > 0;

    return (
        <main className="kh-container">
            <p className="kh-eyebrow">KLARHED · { chapters.length } kapitler · baseline + slutmåling</p>
            <h1 className="kh-h1">Fra indsigt til <em>integreret</em> lederskab.</h1>
            { ( course?.description || course?.tagline ) && (
                <p className="kh-lead">{ course.description || course.tagline }</p>
            ) }

            { hasBaseline
                ? <BaselineSummary groups={ course?.baseline?.groups || [] } baseline={ active.baseline } go={ go } />
                : <BaselineCTA go={ go } /> }

            <h2 className="kh-h2">Kapitler</h2>
            <div className="kh-chapter-grid">
                { chapters.map( ( ch, idx ) => (
                    <ChapterCard key={ ch.slug } ch={ ch } idx={ idx } progress={ active?.progress || {} } go={ go } />
                ) ) }
            </div>

            { hasBaseline && (
                <div className="kh-dashboard-actions">
                    <button className="kh-btn kh-btn--ghost" onClick={ () => go( { view: 'compare' } ) }>
                        Se din transformation →
                    </button>
                </div>
            ) }
        </main>
    );
}

function BaselineCTA( { go } ) {
    return (
        <div className="kh-card kh-card--accent">
            <div>
                <p className="kh-eyebrow">Start her · 10 min</p>
                <h3 className="kh-h3">Tag din baseline-måling</h3>
                <p className="kh-muted">Før vi dykker ned i KLARHED-modellen, skal vi vide, hvor du står. Vær ærlig — der er ingen rigtige eller forkerte svar.</p>
            </div>
            <button className="kh-btn kh-btn--lime" onClick={ () => go( { view: 'baseline' } ) }>
                Start baseline →
            </button>
        </div>
    );
}

function BaselineSummary( { groups, baseline, go } ) {
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
                { groups.map( ( g ) => {
                    const vals = ( g.items || [] ).map( ( _, i ) => Number( baseline[ `${ g.letter }:${ i }` ] ) || 0 );
                    const avg  = vals.length ? vals.reduce( ( a, b ) => a + b, 0 ) / vals.length : 0;
                    return (
                        <div key={ g.letter } className="kh-mq-row">
                            <span className="kh-mq-letter">{ g.letter }</span>
                            <span className="kh-mq-name">{ g.name }</span>
                            <div className="kh-mq-bar">
                                <div className="kh-mq-fill" style={ { width: `${ avg / 5 * 100 }%` } } />
                            </div>
                            <span className="kh-mq-num">{ avg ? avg.toFixed( 1 ) : '—' }</span>
                        </div>
                    );
                } ) }
            </div>
        </div>
    );
}

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
