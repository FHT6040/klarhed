// src/app/App.jsx — top-level router for KLARHED course frontend
import { useEffect, useState } from '@wordpress/element';
import { Dashboard } from './views/Dashboard.jsx';
import { Baseline } from './views/Baseline.jsx';
import { Chapter } from './views/Chapter.jsx';
import { Comparison } from './views/Comparison.jsx';
import { Header } from './components/Header.jsx';

export function App( { boot, store } ) {
    const [ snapshot, setSnapshot ] = useState( store.get() );
    const [ route, setRoute ] = useState( () => {
        try { return JSON.parse( localStorage.getItem( 'klarhed_route' ) ) || { view: 'home' }; }
        catch { return { view: 'home' }; }
    } );

    useEffect( () => store.subscribe( setSnapshot ), [] );
    useEffect( () => { if ( boot.loggedIn ) store.load(); }, [] );

    const go = ( r ) => { setRoute( r ); localStorage.setItem( 'klarhed_route', JSON.stringify( r ) ); };

    if ( ! boot.loggedIn ) return <div className="klarhed-login-cta">Log ind for at tilgå dit KLARHED-forløb.</div>;
    if ( snapshot.loading ) return <div className="klarhed-loading">Indlæser…</div>;

    return (
        <div className="klarhed-app">
            <Header snapshot={ snapshot } store={ store } go={ go } onHome={ () => go( { view: 'home' } ) } />
            { route.view === 'home'     && <Dashboard course={ boot.course } snapshot={ snapshot } store={ store } go={ go } /> }
            { route.view === 'baseline' && <Baseline   course={ boot.course } snapshot={ snapshot } store={ store } go={ go } /> }
            { route.view === 'chapter'  && <Chapter    course={ boot.course } snapshot={ snapshot } store={ store } go={ go } idx={ route.idx } lesson={ route.lesson } /> }
            { route.view === 'compare'  && <Comparison course={ boot.course } snapshot={ snapshot } go={ go } /> }
        </div>
    );
}
