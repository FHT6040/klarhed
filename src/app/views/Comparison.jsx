export function Comparison( { course, snapshot, go } ) {
    const active       = snapshot.attempts.find( ( a ) => a.id === snapshot.activeId );
    const groups       = course?.baseline?.groups || [];
    const baseline     = active?.baseline     || {};
    const finalMeasure = active?.finalMeasure || {};
    const hasBaseline  = Object.keys( baseline ).length > 0;
    const hasFinal     = Object.keys( finalMeasure ).length > 0;

    const rows = groups.map( ( g ) => {
        const bVals = ( g.items || [] ).map( ( _, i ) => Number( baseline[ `${ g.letter }:${ i }` ] ) || 0 );
        const fVals = ( g.items || [] ).map( ( _, i ) => Number( finalMeasure[ `${ g.letter }:${ i }` ] ) || 0 );
        const bAvg  = bVals.length ? bVals.reduce( ( a, b ) => a + b, 0 ) / bVals.length : 0;
        const fAvg  = fVals.length ? fVals.reduce( ( a, b ) => a + b, 0 ) / fVals.length : 0;
        return { ...g, bAvg, fAvg, diff: fAvg - bAvg };
    } );

    const withBoth    = rows.filter( ( r ) => r.bAvg > 0 && r.fAvg > 0 );
    const totalBefore = withBoth.length ? withBoth.reduce( ( a, r ) => a + r.bAvg, 0 ) / withBoth.length : 0;
    const totalAfter  = withBoth.length ? withBoth.reduce( ( a, r ) => a + r.fAvg, 0 ) / withBoth.length : 0;
    const totalDiff   = totalAfter - totalBefore;

    return (
        <main className="kh-container">
            <button className="kh-back" onClick={ () => go( { view: 'home' } ) }>← Dashboard</button>
            <p className="kh-eyebrow">Transformation · Baseline vs. slutmåling</p>
            <h1 className="kh-h1">Din <em>transformation</em> i KLARHED.</h1>

            { ! hasBaseline && (
                <div className="kh-card">
                    <p className="kh-muted" style={ { marginBottom: 16 } }>Du har endnu ikke udfyldt din baseline-måling.</p>
                    <button className="kh-btn kh-btn--lime" onClick={ () => go( { view: 'baseline' } ) }>
                        Tag baseline-måling →
                    </button>
                </div>
            ) }

            { hasBaseline && ! hasFinal && (
                <div className="kh-card kh-card--accent">
                    <div>
                        <p className="kh-eyebrow">Afslut forløbet</p>
                        <h3 className="kh-h3">Slutmåling ikke udfyldt endnu</h3>
                        <p className="kh-muted">Gennemfør kapitel 8 for at se din fulde transformation.</p>
                    </div>
                </div>
            ) }

            { hasBaseline && (
                <>
                    { withBoth.length > 0 && (
                        <div className="kh-transformation-summary">
                            <div className="kh-transform-score">
                                <span className={ `kh-transform-num${ totalDiff < 0 ? ' is-neg' : '' }` }>
                                    { totalDiff > 0 ? '+' : '' }{ totalDiff.toFixed( 1 ) }
                                </span>
                                <span className="kh-transform-label">Samlet fremgang</span>
                            </div>
                            <p className="kh-muted">Gennemsnit over { withBoth.length } KLARHED-dimensioner</p>
                        </div>
                    ) }

                    <div className="kh-compare-legend">
                        <span className="kh-compare-legend-item kh-compare-legend-item--before">Baseline</span>
                        <span className="kh-compare-legend-item kh-compare-legend-item--after">Slutmåling</span>
                    </div>

                    <div className="kh-compare-grid">
                        { rows.map( ( row ) => (
                            <div key={ row.letter } className="kh-compare-row">
                                <span className="kh-mq-letter">{ row.letter }</span>
                                <span className="kh-mq-name">{ row.name }</span>
                                <div className="kh-compare-bars">
                                    <div className="kh-compare-bar kh-compare-bar--before" style={ { width: `${ row.bAvg / 5 * 100 }%` } } />
                                    <div className="kh-compare-bar kh-compare-bar--after"  style={ { width: `${ row.fAvg / 5 * 100 }%` } } />
                                </div>
                                <span className={ `kh-compare-diff${ row.diff > 0 ? ' is-pos' : row.diff < 0 ? ' is-neg' : '' }` }>
                                    { row.bAvg ? ( row.diff > 0 ? '+' : '' ) + row.diff.toFixed( 1 ) : '—' }
                                </span>
                            </div>
                        ) ) }
                    </div>
                </>
            ) }
        </main>
    );
}
