// src/app/store.js — lightweight attempts/state store with REST sync
import apiFetch from '@wordpress/api-fetch';

const listeners = new Set();
let state = { loading: true, attempts: [], activeId: null, share: null };

const notify = () => listeners.forEach( ( l ) => l( state ) );
const setState = ( patch ) => { state = { ...state, ...patch }; notify(); };

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

    async saveAnswers( patch ) {
        const id = state.activeId; if ( ! id ) return;
        await apiFetch( { path: `klarhed/v1/attempts/${ id }/answers`, method: 'POST', data: patch } );
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
