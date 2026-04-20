// src/app/App.jsx — top-level router for KLARHED course frontend
import { useEffect, useState } from '@wordpress/element';
import { Dashboard }  from './views/Dashboard.jsx';
import { Baseline }   from './views/Baseline.jsx';
import { Chapter }    from './views/Chapter.jsx';
import { Comparison } from './views/Comparison.jsx';
import { Header }     from './components/Header.jsx';

const MILESTONE_MESSAGES = {
    25:  [ 'Godt i gang',         'Du er 25% igennem KLARHED-forløbet.' ],
    50:  [ 'Halvvejs',            'Det er her det begynder at sætte sig for alvor.' ],
    75:  [ 'Tre fjerdedele',      'Du er tæt på slutmålingen nu.' ],
    100: [ 'Forløbet gennemført', 'Du har gennemgået hele KLARHED.' ],
};

export function App( { boot, store } ) {
    const [ snapshot, setSnapshot ] = useState( store.get() );
    const [ route, setRoute ]       = useState( () => {
        try { return JSON.parse( localStorage.getItem( 'klarhed_route' ) ) || { view: 'home' }; }
        catch { return { view: 'home' }; }
    } );
    const [ milestone, setMilestone ] = useState( null );

    useEffect( () => store.subscribe( setSnapshot ), [] );
    useEffect( () => { if ( boot.loggedIn ) store.load(); }, [] );

    // Milestone detection — runs whenever progress changes
    useEffect( () => {
        if ( snapshot.loading ) return;
        const active = snapshot.attempts.find( ( a ) => a.id === snapshot.activeId );
        if ( ! active ) return;
        const total     = ( boot.course?.chapters || [] ).reduce( ( n, c ) => n + ( c.lessons || [] ).length, 0 );
        const completed = Object.values( active.progress || {} ).filter( Boolean ).length;
        const pct       = total ? Math.round( completed / total * 100 ) : 0;
        const shown     = JSON.parse( localStorage.getItem( 'kh_milestones' ) || '[]' );
        for ( const m of [ 25, 50, 75, 100 ] ) {
            if ( pct >= m && ! shown.includes( m ) ) {
                localStorage.setItem( 'kh_milestones', JSON.stringify( [ ...shown, m ] ) );
                setMilestone( m );
                break;
            }
        }
    }, [ snapshot ] );

    const go = ( r ) => {
        setRoute( r );
        localStorage.setItem( 'klarhed_route', JSON.stringify( r ) );
        window.scrollTo( { top: 0, behavior: 'smooth' } );
    };

    if ( ! boot.loggedIn ) return (
        <div className="kh-root kh-login-cta">Log ind for at tilgå dit KLARHED-forløb.</div>
    );
    if ( snapshot.loading ) return (
        <div className="kh-root kh-loading"><span>Indlæser…</span></div>
    );

    return (
        <div className="kh-root">
            <Header course={ boot.course } snapshot={ snapshot } go={ go } />
            { route.view === 'home'     && <Dashboard  course={ boot.course } snapshot={ snapshot } store={ store } go={ go } user={ boot.user } /> }
            { route.view === 'baseline' && <Baseline   course={ boot.course } snapshot={ snapshot } store={ store } go={ go } /> }
            { route.view === 'chapter'  && <Chapter    course={ boot.course } snapshot={ snapshot } store={ store } go={ go } idx={ route.idx } /> }
            { route.view === 'compare'  && <Comparison course={ boot.course } snapshot={ snapshot } go={ go } /> }
            { milestone && (
                <MilestoneToast pct={ milestone } onDismiss={ () => setMilestone( null ) } />
            ) }
        </div>
    );
}

function MilestoneToast( { pct, onDismiss } ) {
    useEffect( () => {
        const t = setTimeout( onDismiss, 7000 );
        return () => clearTimeout( t );
    }, [] );

    const [ title, body ] = MILESTONE_MESSAGES[ pct ] || [ '', '' ];
    return (
        <div className="kh-milestone-toast">
            <span className="kh-milestone-pct">{ pct }%</span>
            <div className="kh-milestone-text">
                <strong>{ title }</strong>
                <p>{ body }</p>
            </div>
            <button className="kh-milestone-dismiss" onClick={ onDismiss } aria-label="Luk">×</button>
        </div>
    );
}
