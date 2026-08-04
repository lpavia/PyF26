# PyF26 — Development Setup & Deployment

How to pick the project up on a new machine, and how to host it somewhere other
than GitHub Pages.

> See [architecture.md](./architecture.md) for how the app itself is structured.

---

## 1. Continuing development on another machine

Cloning the repository is enough. Nothing else needs to be copied across —
not `node_modules`, not `dist`, not any local config.

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Git | any | |
| Node.js | 20 LTS or 22 LTS | `.github/workflows/deploy.yml` pins **Node 20**; matching it locally guarantees the same build. There is no `engines` field, and newer versions work fine. |

npm ships with Node. Nothing is needed globally — Vite, TypeScript and Tailwind
all live in `node_modules` and run through `npm run …`.

### Setup

```bash
git clone https://github.com/lpavia/PyF26.git
cd PyF26
npm ci
npm run dev
```

`npm run dev` prints the URL to open. Note it includes the base path —
**http://localhost:5173/PyF26/**, not the bare root. (Visiting the root just
302-redirects there, and Vite picks the next free port if 5173 is taken, so
always use the URL it prints.)

### Why `node_modules` isn't in the repository

`package.json` declares *what* the project depends on, using loose ranges like
`^18.3.1`. **`package-lock.json`** — which *is* committed — records the exact
resolved tree: every transitive package, its precise version, its registry URL
and an integrity hash. `npm ci` reads that lockfile and reproduces
`node_modules` byte for byte.

The lockfile *is* the dependency state, at 1% of the size. Committing
`node_modules` was not just redundant but actively harmful, because parts of it
are **platform-specific compiled binaries**:

```
node_modules/@esbuild/win32-x64
node_modules/@rollup/rollup-win32-x64-msvc
```

Those are Windows-only. The lockfile lists all ~20 platform variants as
optional dependencies, and npm installs only the one matching the current OS and
CPU. Cloning a Windows `node_modules` onto a Mac produced a broken tree
(`esbuild` fails with *"you installed esbuild for another platform"*). With it
removed, `npm ci` on an M-series Mac transparently fetches
`@esbuild/darwin-arm64` instead.

### `npm ci` vs `npm install`

|  | `npm ci` | `npm install` |
|---|---|---|
| Reads | lockfile only | `package.json`, may re-resolve |
| Existing `node_modules` | deleted first | merged into |
| Lockfile | never modified | may be rewritten |
| Use it | every clone, every CI run | only when adding/upgrading a package |

`npm ci` is exactly what CI runs, so your local tree matches the deployed build.
After an `npm install` that changes `package-lock.json`, commit the lockfile.

### Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload. The service worker is **disabled** here (`devOptions.enabled: false` in `vite.config.ts`) so it can't serve stale files while you edit. |
| `npm run build` | Type-checks (`tsc -b`) then builds to `dist/`, generating `sw.js` and `manifest.webmanifest`. |
| `npm run preview` | Serves the real `dist/` build locally — **the only way to test PWA behaviour**, since dev has no service worker. |
| `npm run icons` | Regenerates the PWA PNGs from `scripts/generate-icons.mjs`. Only needed if you change the icon design; the PNGs are committed. |

> `npm run lint` is declared in `package.json` but **eslint is not installed**,
> so it currently fails. Either `npm i -D eslint` with a config, or drop the
> script.

### Testing the PWA locally

Service workers require a secure context — HTTPS, **or** `localhost`, which
browsers exempt. So `npm run preview` on localhost is enough:

```bash
npm run build
npm run preview      # http://localhost:4173/PyF26/
```

Then DevTools → **Application** → *Manifest* (no errors) and *Service Workers*
(activated). Tick **Network → Offline** and reload; the game should still load.

To clear a stuck worker: Application → Service Workers → **Unregister**, or
*Clear site data*.

---

## 2. How the current deployment works

`.github/workflows/deploy.yml` runs on every push to `master`:

```
checkout → setup-node 20 → npm ci → npm run build → upload dist/ → deploy-pages
```

GitHub Pages serves the **artifact that workflow uploads**. It does not serve
any committed folder, and `dist/` is deliberately git-ignored. Repository
Settings → Pages must have **Source: GitHub Actions**.

---

## 3. Deploying to a different host

The build is entirely static — `dist/` is ~2.1 MB of files with no backend, no
environment variables and no runtime configuration. Any static host works.

### Step 1 — set the base path

This is the only code change, and it is one line.
[`vite.config.ts`](../vite.config.ts) defines:

```ts
const BASE = '/PyF26/'
```

`BASE` deliberately feeds **everything** that depends on the URL prefix — Vite's
`base`, the manifest's `id` / `start_url` / `scope`, and Workbox's
`navigateFallback`. Change that one constant and the whole PWA follows.

| Where the app will live | `BASE` |
|---|---|
| `https://example.com/` (domain root) | `'/'` |
| `https://example.com/games/pyf/` | `'/games/pyf/'` |

Getting this wrong is the usual cause of a blank page: assets 404 because
`index.html` requests them from the wrong prefix.

> Manifest icon paths need no edit — they are declared relative
> (`icons/icon-192.png`) and resolve against wherever the manifest ends up.

### Step 2 — update the absolute social URLs

[`index.html`](../index.html) hardcodes the deployed origin in two `og:` tags
(lines 19–20). These must be absolute, so they can't use `BASE`:

```html
<meta property="og:image" content="https://lpavia.github.io/PyF26/og.png" />
<meta property="og:url"   content="https://lpavia.github.io/PyF26/" />
```

Purely cosmetic — they only affect link previews in WhatsApp, Slack, etc.

Also consider whether the Google Analytics tag (`G-144NJM1RWB`) should still
fire from the new host.

### Step 3 — build and upload

```bash
npm ci
npm run build
```

Upload the **contents** of `dist/` to your web root:

```
index.html            manifest.webmanifest   sw.js
registerSW.js         workbox-<hash>.js      favicon.svg
apple-touch-icon.png  og.png
assets/index-<hash>.js
assets/index-<hash>.css
icons/icon-192.png  icon-512.png  icon-maskable-512.png
```

### Server requirements

Static hosting is nearly enough, but a PWA adds four constraints:

**1. HTTPS is mandatory.** Service workers refuse to register over plain HTTP
(except on `localhost`). Without it the app still works, but it won't install
or run offline. Use Let's Encrypt / Caddy / your host's automatic TLS.

**2. `.webmanifest` needs the right MIME type.** Several servers don't know
this extension and fall back to `text/plain`, which some browsers reject.
Verify after deploying:

```bash
curl -sI https://your-host/manifest.webmanifest | grep -i content-type
# want: application/manifest+json
```

**3. `sw.js` must sit at the scope root.** A worker served from `/sw.js` can
control the whole site; one served from `/static/sw.js` can only control
`/static/`. Keep `dist/`'s layout flat — don't move `sw.js` into a subfolder.

**4. Cache headers matter.**

| Path | `Cache-Control` | Why |
|---|---|---|
| `/assets/*` | `public, max-age=31536000, immutable` | Filenames are content-hashed — a change means a new name |
| `index.html`, `sw.js`, `manifest.webmanifest`, `registerSW.js` | `no-cache` | Must be revalidated or users never see new deploys |

Getting this backwards — caching `sw.js` for a year — strands users on an old
build that they cannot escape without clearing site data.

### Host recipes

<details>
<summary><b>Netlify</b></summary>

`netlify.toml` in the repo root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"
```

Netlify serves `.webmanifest` correctly and provides HTTPS automatically.
</details>

<details>
<summary><b>Vercel</b></summary>

`vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    }
  ]
}
```
</details>

<details>
<summary><b>Cloudflare Pages</b></summary>

Build command `npm run build`, output directory `dist`, and set
`NODE_VERSION=20`. Add a `_headers` file in `public/` so it is copied into
`dist/`:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/sw.js
  Cache-Control: no-cache
```
</details>

<details>
<summary><b>nginx</b></summary>

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name puntoyfama.example.com;

    root /var/www/pyf26;   # the contents of dist/
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Hashed filenames — safe to cache forever
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Must always revalidate, or updates never reach installed users
    location = /sw.js {
        add_header Cache-Control "no-cache";
    }

    # Some nginx builds lack a .webmanifest mapping and would send text/plain
    location = /manifest.webmanifest {
        default_type application/manifest+json;
        add_header Cache-Control "no-cache";
    }
}
```

> Avoid adding a bare `types { … }` block inside `server` — it *replaces* the
> inherited MIME map rather than extending it. The `default_type` above is
> scoped to one location and is safe either way.
</details>

<details>
<summary><b>Apache</b></summary>

`.htaccess` in the web root (needs `mod_rewrite` and `mod_headers`):

```apache
AddType application/manifest+json .webmanifest

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

<If "%{REQUEST_URI} =~ m#^/assets/#">
  Header set Cache-Control "public, max-age=31536000, immutable"
</If>

<FilesMatch "^(sw\.js|registerSW\.js|manifest\.webmanifest|index\.html)$">
  Header set Cache-Control "no-cache"
</FilesMatch>
```
</details>

<details>
<summary><b>AWS S3 + CloudFront</b></summary>

S3 guesses content types from extensions and gets `.webmanifest` wrong, so set
it explicitly. Upload in two passes:

```bash
# 1. Hashed assets — cache forever
aws s3 sync dist/ s3://your-bucket/ \
  --exclude "*" --include "assets/*" \
  --cache-control "public, max-age=31536000, immutable"

# 2. Everything else — always revalidate
aws s3 sync dist/ s3://your-bucket/ --exclude "assets/*" \
  --cache-control "no-cache"

# 3. Fix the manifest's content type
aws s3 cp s3://your-bucket/manifest.webmanifest s3://your-bucket/manifest.webmanifest \
  --metadata-directive REPLACE \
  --content-type "application/manifest+json" \
  --cache-control "no-cache"

aws cloudfront create-invalidation --distribution-id ABC123 --paths "/*"
```

Set the CloudFront default root object to `index.html`.
</details>

<details>
<summary><b>Docker (self-hosted)</b></summary>

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

Use the nginx recipe above for `nginx.conf`, with `root
/usr/share/nginx/html;`. Terminate TLS at a reverse proxy in front (Caddy,
Traefik) — the service worker will not register without it.
</details>

---

## 4. If you retire the GitHub Pages deployment

This one is easy to miss. Anyone who has already visited
`lpavia.github.io/PyF26/` has a **registered service worker with the whole app
precached**. Deleting the site does not remove it — their browser keeps serving
the cached copy from disk, potentially for years, and they never learn the app
moved.

Deploy a *self-destructing* worker to the old URL rather than deleting it.
Replace `dist/sw.js` with:

```js
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', async () => {
  await self.registration.unregister();
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((c) => c.navigate(c.url));
});
```

Alongside an `index.html` that redirects to the new host. Returning visitors
then unregister the old worker, drop the stale caches, and land on the new
site. Leave that in place for a few months before taking the URL down.

---

## 5. Post-deployment checklist

```bash
B=https://your-host          # plus the base path, if any

for p in / /manifest.webmanifest /sw.js /registerSW.js \
         /icons/icon-192.png /icons/icon-512.png \
         /icons/icon-maskable-512.png /apple-touch-icon.png; do
  printf "%-32s %s\n" "$p" \
    "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' $B$p)"
done
```

- [ ] Every path returns **200**
- [ ] `manifest.webmanifest` is `application/manifest+json`
- [ ] Site is served over **HTTPS**
- [ ] `start_url` and `scope` in the served manifest match the real URL
- [ ] DevTools → Application → Manifest: no errors, icons preview
- [ ] DevTools → Application → Service Workers: **activated**
- [ ] Network → Offline, reload: game still loads
- [ ] Install button appears in Chrome/Edge's address bar
- [ ] Installed window opens with the indigo splash — no white flash

A white flash on launch means `background_color` in the manifest has drifted
from the app's actual background colour.
