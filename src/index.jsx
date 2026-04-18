/**
 * src/index.jsx — KLARHED frontend app entry
 *
 * Built with @wordpress/scripts to assets/build/index.js
 * Enqueued by klarhed.php when [klarhed_course] is rendered.
 * Mounts a React tree into every <div id="klarhed-root"> on the page.
 */
import { createRoot, StrictMode } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

import { App } from './app/App.jsx';
import { store } from './app/store.js';

const boot = window.KLARHED_BOOT || {};
apiFetch.use( apiFetch.createNonceMiddleware( boot.nonce ) );
apiFetch.use( apiFetch.createRootURLMiddleware( boot.restUrl ) );

document.querySelectorAll( '#klarhed-root' ).forEach( ( node ) => {
    createRoot( node ).render(
        <StrictMode>
            <App boot={ boot } store={ store } />
        </StrictMode>
    );
} );
