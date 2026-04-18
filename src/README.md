KLARHED — React frontend source
================================

`src/index.jsx` bootstraps the frontend app. Build with:

    npm install
    npm run build        # production bundle -> assets/build/index.js
    npm run start        # watch + HMR during development

The PHP side (`Klarhed_Plugin::enqueue_frontend`) enqueues `assets/build/index.js`
when `assets/build/index.asset.php` exists (wp-scripts writes both on build).
Falls back to `assets/js/klarhed-app.js` (the shipped demo bundle) otherwise.

The views under `src/app/views/` mirror the demo JSX in the preview one-to-one —
the shipped 1.0.0 plugin includes a pre-built `assets/build/` so end users don't
need Node to run it; source is here only for developers who want to extend.
