/* KLARHED service worker — offline-first for course content */
const CACHE = 'klarhed-v1.2.7';

self.addEventListener( 'install', () => self.skipWaiting() );

self.addEventListener( 'activate', ( e ) => {
    e.waitUntil(
        caches.keys()
            .then( ( keys ) => Promise.all(
                keys.filter( ( k ) => k !== CACHE ).map( ( k ) => caches.delete( k ) )
            ) )
            .then( () => self.clients.claim() )
    );
} );

self.addEventListener( 'fetch', ( e ) => {
    const { request } = e;
    const url = new URL( request.url );

    if ( url.origin !== location.origin ) return;

    // REST API — network-first, cached offline fallback
    if ( url.pathname.startsWith( '/wp-json/klarhed/' ) ) {
        e.respondWith( networkFirst( request ) );
        return;
    }

    // Plugin static assets — stale-while-revalidate
    if ( url.pathname.includes( '/plugins/klarhed/assets/' ) ) {
        e.respondWith( staleWhileRevalidate( request ) );
        return;
    }

    // HTML pages — network-first
    if ( request.mode === 'navigate' ) {
        e.respondWith( networkFirst( request ) );
    }
} );

async function networkFirst( request ) {
    const cache = await caches.open( CACHE );
    try {
        const response = await fetch( request );
        if ( response.ok ) cache.put( request, response.clone() );
        return response;
    } catch {
        const cached = await cache.match( request );
        return cached || new Response(
            JSON.stringify( { offline: true } ),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

async function staleWhileRevalidate( request ) {
    const cache  = await caches.open( CACHE );
    const cached = await cache.match( request );
    const networkPromise = fetch( request ).then( ( response ) => {
        if ( response.ok ) cache.put( request, response.clone() );
        return response;
    } ).catch( () => null );
    return cached || networkPromise;
}
