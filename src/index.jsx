/**
 * src/index.jsx — KLARHED frontend app entry
 *
 * Built with @wordpress/scripts to assets/build/index.js
 * Enqueued by klarhed.php when [klarhed_course] is rendered.
 * Mounts a React tree into every <div id="klarhed-root"> on the page.
 */
import { createRoot, StrictMode } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

import { App }   from './app/App.jsx';
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

// ── PWA install prompt ────────────────────────────────────────────────────
let deferredPrompt = null;

window.addEventListener( 'beforeinstallprompt', ( e ) => {
    e.preventDefault();
    deferredPrompt = e;
    // Show after a brief delay so it doesn't appear immediately on first visit
    setTimeout( showInstallPrompt, 3000 );
} );

function showInstallPrompt() {
    if ( localStorage.getItem( 'kh_install_dismissed' ) ) return;
    if ( document.getElementById( 'kh-install-prompt' ) ) return;

    const el = document.createElement( 'div' );
    el.id        = 'kh-install-prompt';
    el.className = 'kh-install-prompt';
    el.innerHTML = `
        <div class="kh-install-prompt-text">
            <strong>Tilføj til startskærm</strong>
            Åbn dit KLARHED-forløb direkte fra din telefon — offline inkl.
        </div>
        <div class="kh-install-prompt-btns">
            <button class="kh-btn kh-btn--lime" id="kh-install-ok">Installer</button>
        </div>
        <button class="kh-install-dismiss" id="kh-install-x" aria-label="Luk">×</button>
    `;
    document.body.appendChild( el );

    document.getElementById( 'kh-install-ok' ).addEventListener( 'click', async () => {
        if ( ! deferredPrompt ) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        el.remove();
    } );

    document.getElementById( 'kh-install-x' ).addEventListener( 'click', () => {
        localStorage.setItem( 'kh_install_dismissed', '1' );
        el.remove();
    } );
}
