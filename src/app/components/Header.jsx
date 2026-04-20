import { useMemo } from '@wordpress/element';

export function Header( { course, snapshot, go } ) {
    const total = useMemo(
        () => ( course?.chapters || [] ).reduce( ( n, c ) => n + ( c.lessons || [] ).length, 0 ),
        [ course ]
    );
    const active    = snapshot.attempts.find( ( a ) => a.id === snapshot.activeId );
    const completed = Object.values( active?.progress || {} ).filter( Boolean ).length;
    const pct       = total ? Math.round( completed / total * 100 ) : 0;

    return (
        <header className="kh-header">
            <div className="kh-header-inner">
                <button className="kh-brand" onClick={ () => go( { view: 'home' } ) }>
                    <span className="kh-brand-serif">Klarhed</span>
                    <span className="kh-brand-slash">/</span>
                    <span className="kh-brand-sans">Lederskab</span>
                </button>
                <div className="kh-header-progress">
                    <div className="kh-progress-track">
                        <div className="kh-progress-fill" style={ { width: `${ pct }%` } } />
                    </div>
                    <span className="kh-progress-num">{ pct }%</span>
                </div>
            </div>
        </header>
    );
}
