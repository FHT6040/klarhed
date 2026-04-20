import { useCallback } from '@wordpress/element';

export function Baseline( { course, snapshot, store, go } ) {
    const active      = snapshot.attempts.find( ( a ) => a.id === snapshot.activeId );
    const groups      = course?.baseline?.groups || [];
    const baseline    = active?.baseline || {};
    const totalItems  = groups.reduce( ( n, g ) => n + ( g.items || [] ).length, 0 );
    const answered    = Object.keys( baseline ).filter( ( k ) => baseline[ k ] > 0 ).length;

    const handleSelect = useCallback( ( key, value ) => {
        store.saveAnswers( { baseline: { [ key ]: value } } );
    }, [ store ] );

    return (
        <main className="kh-container">
            <button className="kh-back" onClick={ () => go( { view: 'home' } ) }>← Dashboard</button>
            <p className="kh-eyebrow">Baseline-måling · { totalItems } udsagn · 10 min</p>
            <h1 className="kh-h1">Hvor <em>står</em> du lige nu?</h1>
            <p className="kh-lead">Dit udgangspunkt er det, der gør din transformation synlig. Svar ærligt — dine svar er kun synlige for dig.</p>
            { course?.baseline?.scale && <p className="kh-muted">{ course.baseline.scale }</p> }

            <div className="kh-baseline-progress-line">
                <span className="kh-muted">{ answered } af { totalItems } besvaret</span>
                <div className="kh-progress-track" style={ { flex: 1, maxWidth: 200 } }>
                    <div className="kh-progress-fill" style={ { width: `${ totalItems ? answered / totalItems * 100 : 0 }%` } } />
                </div>
            </div>

            <div className="kh-baseline">
                { groups.map( ( g ) => (
                    <BaselineGroup key={ g.letter } group={ g } baseline={ baseline } onSelect={ handleSelect } />
                ) ) }
            </div>

            <div className="kh-baseline-footer">
                <button className="kh-btn kh-btn--lime" onClick={ () => go( { view: 'home' } ) }>
                    Gem og fortsæt →
                </button>
            </div>
        </main>
    );
}

function BaselineGroup( { group, baseline, onSelect } ) {
    return (
        <section className="kh-baseline-group">
            <h3 className="kh-baseline-letter">
                <span className="kh-baseline-letter-big">{ group.letter }</span>
                <span className="kh-baseline-name">{ group.name }</span>
            </h3>
            <div className="kh-baseline-items">
                { ( group.items || [] ).map( ( item, i ) => {
                    const key = `${ group.letter }:${ i }`;
                    const val = Number( baseline[ key ] ) || 0;
                    return (
                        <div key={ key } className="kh-baseline-item">
                            <p className="kh-baseline-text">{ item }</p>
                            <div className="kh-scale">
                                { [ 1, 2, 3, 4, 5 ].map( ( n ) => (
                                    <button
                                        key={ n }
                                        className={ `kh-scale-btn${ val === n ? ' is-active' : '' }` }
                                        onClick={ () => onSelect( key, n ) }
                                    >
                                        { n }
                                    </button>
                                ) ) }
                            </div>
                        </div>
                    );
                } ) }
            </div>
        </section>
    );
}
