# Deployment Validation Report

- **Generated:** 2026-07-09T16:09:46.735Z
- **Status:** PASS
- **Frontend:** `/home/ian-mabruk/burea/burea`
- **Build artifact:** `/home/ian-mabruk/burea/burea/dist` (`index.html` present)
- **.htaccess present:** yes

## Routing status
- Routes tested: 22, fall-through OK: 22
- ✅ Every route falls back to index.html (refresh-safe).

## Checks
- ✅ dist/.htaccess present — /home/ian-mabruk/burea/burea/dist/.htaccess
- ✅ .htaccess rule: RewriteEngine On
- ✅ .htaccess rule: RewriteBase /
- ✅ .htaccess rule: RewriteRule ^index\.html$ - [L]
- ✅ .htaccess rule: !-f condition
- ✅ .htaccess rule: !-d condition
- ✅ .htaccess rule: RewriteRule . /index.html [L]
- ✅ .htaccess rule: ErrorDocument 404 /index.html
- ✅ dist/index.html present — /home/ian-mabruk/burea/burea/dist/index.html
- ✅ All index.html asset references resolve — 8 local refs checked
- ✅ Asset paths are root-relative (base "/") — refreshes on sub-routes cannot blank-page
- ✅ All routes fall back to index.html on refresh — 22 routes validated (incl. /projects, /about, /contact)
- ✅ No SSR dependency (client-only SPA) — index.html mounts #root; no ReactDOMServer usage
- ✅ Deployment package carries .htaccess — /home/ian-mabruk/burea/.cpanel-deployment/public_html-ready
- ✅ Deployment package carries index.html — /home/ian-mabruk/burea/.cpanel-deployment/public_html-ready

## API connectivity
- Backend origin: `https://winga-backend.onrender.com`
- ✅ VITE_API_URL configured — https://winga-backend.onrender.com
- ✅ GET /health — HTTP 200
- ⚠️  GET /api/rates/live?branch=HEAD OFFICE — unreachable / offline (skipped)


  - [x] dist/.htaccess exists (SPA rewrite rules present)
  - [x] public_html-ready/.htaccess exists (final package)
  - [x] dist/index.html exists
  - [x] All generated assets use root-relative paths (/assets/...)
  - [x] Routes /rates, /calculator, /dashboard, /projects, /about, /contact resolve to index.html
  - [x] No server-side rendering — pure client SPA
  - [x] Backend origin (VITE_API_URL) configured

**After uploading to cPanel public_html/, confirm on the live server:**
  - [ ] curl -sI https://YOURDOMAIN/rates returns HTTP/1.1 200 (not 404)
  - [ ] ls -la ~/public_html/.htaccess shows the file (dotfiles are hidden by default in File Manager)

## Remaining deployment risks
- The `.htaccess` dotfile is hidden in cPanel File Manager / skipped by many upload tools. If `~/public_html/.htaccess` is absent, routes 404. Use cPanel Terminal to write it in place (see report footer).
- Backend (`VITE_API_URL`) is a separate origin; ensure its `FRONTEND_ORIGIN` allows the cPanel domain.
- In production the backend hard-exits if `FRONTEND_ORIGIN`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `WINGA_API_KEY`, `WINGA_API_SECRET` are unset.
- Free-tier backend hosts (e.g. onrender.com) cold-start; the SPA falls back to clearly-labelled static reference rates until the backend responds.
