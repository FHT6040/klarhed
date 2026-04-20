// src/app/store.js — lightweight attempts/state store with REST sync
import apiFetch from '@wordpress/api-fetch';

const listeners = new Set();
let state = { loading: true, attempts: [], activeId: null, share: null };

const notify  = () => listeners.forEach( ( l ) => l( state ) );
const setState = ( patch ) => { state = { ...state, ...patch }; notify(); };

function mergeIntoActive( id, patch ) {
    return state.attempts.map( ( a ) => {
        if ( a.id !== id ) return a;
        const next = { ...a };
        for ( const k of [ 'progress', 'fields', 'baseline', 'finalMeasure' ] ) {
            if ( patch[ k ] ) next[ k ] = { ...( a[ k ] || {} ), ...patch[ k ] };
        }
        return next;
    } );
}

let syncTimer   = null;
let pendingSync = null;

function merge4( a, b ) {
    const r = {};
    for ( const k of [ 'progress', 'fields', 'baseline', 'finalMeasure' ] ) {
        r[ k ] = { ...( a[ k ] || {} ), ...( b[ k ] || {} ) };
    }
    return r;
}

export const store = {
    subscribe: ( fn ) => { listeners.add( fn ); fn( state ); return () => listeners.delete( fn ); },
    get: () => state,

    async load() {
        const [ attempts, share ] = await Promise.all( [
            apiFetch( { path: 'klarhed/v1/attempts' } ),
            apiFetch( { path: 'klarhed/v1/share' } ),
        ] );
        const active = attempts.find( ( a ) => a.status === 'active' ) || attempts[ attempts.length - 1 ];
        setState( { loading: false, attempts, activeId: active?.id, share } );
    },

    async startNew( name ) {
        const a = await apiFetch( { path: 'klarhed/v1/attempts', method: 'POST', data: { name } } );
        await this.load();
        return a;
    },

    async switchTo( id ) {
        await apiFetch( { path: `klarhed/v1/attempts/${ id }/activate`, method: 'POST' } );
        await this.load();
    },

    // Optimistic local update + debounced REST sync (accumulates patches)
    saveAnswers( patch ) {
        const id = state.activeId; if ( ! id ) return;
        setState( { attempts: mergeIntoActive( id, patch ) } );
        if ( ! localStorage.getItem( 'kh_engaged' ) ) {
            localStorage.setItem( 'kh_engaged', '1' );
            window.dispatchEvent( new Event( 'kh-engaged' ) );
        }
        pendingSync = pendingSync ? merge4( pendingSync, patch ) : patch;
        clearTimeout( syncTimer );
        syncTimer = setTimeout( () => {
            const p = pendingSync; pendingSync = null;
            apiFetch( { path: `klarhed/v1/attempts/${ id }/answers`, method: 'POST', data: p } )
                .catch( () => {} ); // offline OK
        }, 800 );
    },

    async updateShare( patch ) {
        const share = await apiFetch( { path: 'klarhed/v1/share', method: 'POST', data: patch } );
        setState( { share } );
    },

    async revokeShare() {
        await apiFetch( { path: 'klarhed/v1/share', method: 'DELETE' } );
        await this.load();
    },
};
