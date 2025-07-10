# Railway Build & Deploy Log

---

[Region: us-east4]

=========================

Using Detected Dockerfile

=========================


context: d9hr-XsjF

[internal] load build definition from Dockerfile

[internal] load build definition from Dockerfile  ✔ 0 ms

[internal] load build definition from Dockerfile

[internal] load build definition from Dockerfile  ✔ 9 ms

[internal] load metadata for docker.io/library/node:20-alpine

[internal] load metadata for docker.io/library/node:20

[auth] library/node:pull token for registry-1.docker.io

[auth] library/node:pull token for registry-1.docker.io  ✔ 0 ms

[internal] load metadata for docker.io/library/node:20  ✔ 139 ms

[internal] load metadata for docker.io/library/node:20-alpine  ✔ 169 ms

[internal] load .dockerignore

[internal] load .dockerignore

[internal] load .dockerignore  ✔ 0 ms

[internal] load .dockerignore

[internal] load .dockerignore  ✔ 11 ms

[prod 5/5] COPY --from=build /app/dist ./dist

[build 5/5] RUN npm run build

[build 4/5] RUN npm install

[build 3/5] COPY . .

[internal] load build context

[build 2/5] WORKDIR /app

[build 1/5] FROM docker.io/library/node:20@sha256:2c3f34d2d28e4c13b26f7244c653527d15544626e85b1a21fb67a95ba4df9a01

[prod 4/5] RUN npm install -g serve

[prod 3/5] RUN apk add --no-cache nodejs npm

[prod 2/5] WORKDIR /app

[prod 1/5] FROM docker.io/library/node:20-alpine@sha256:fa316946c0cb1f041fe46dda150f3085b71168555e5706ec0c7466a5bae12244

[build 1/5] FROM docker.io/library/node:20@sha256:2c3f34d2d28e4c13b26f7244c653527d15544626e85b1a21fb67a95ba4df9a01

[internal] load build context

[prod 1/5] FROM docker.io/library/node:20-alpine@sha256:fa316946c0cb1f041fe46dda150f3085b71168555e5706ec0c7466a5bae12244

[internal] load build context  ✔ 0 ms

[build 1/5] FROM docker.io/library/node:20@sha256:2c3f34d2d28e4c13b26f7244c653527d15544626e85b1a21fb67a95ba4df9a01  ✔ 7 ms

[internal] load build context

[prod 1/5] FROM docker.io/library/node:20-alpine@sha256:fa316946c0cb1f041fe46dda150f3085b71168555e5706ec0c7466a5bae12244  ✔ 9 ms

[internal] load build context  ✔ 48 ms

[prod 2/5] WORKDIR /app  ✔ 0 ms – CACHED

[prod 3/5] RUN apk add --no-cache nodejs npm  ✔ 0 ms – CACHED

[prod 4/5] RUN npm install -g serve  ✔ 0 ms – CACHED

[build 2/5] WORKDIR /app  ✔ 0 ms – CACHED

[build 3/5] COPY . .  ✔ 0 ms – CACHED

[build 4/5] RUN npm install  ✔ 0 ms – CACHED

[build 5/5] RUN npm run build  ✔ 0 ms – CACHED

[prod 5/5] COPY --from=build /app/dist ./dist  ✔ 0 ms – CACHED

[auth] sharing credentials for production-us-east4-eqdc4a.railway-registry.com

[auth] sharing credentials for production-us-east4-eqdc4a.railway-registry.com  ✔ 0 ms

Build time: 4.91 seconds

---

## Why does it work on dev but not on Railway?

This issue is common when code works locally (dev) but fails on Railway (production build). Here are the most likely reasons for the `Uncaught TypeError: (void 0) is not a function` error in production:

1. **Build/Minification Differences**: Production builds (like on Railway) use minifiers and tree-shaking, which can remove or rename code. If you have an import or export error, or a missing dependency, it may only show up in production.

2. **Environment Variables**: Some code may depend on environment variables that are set locally but missing or misconfigured on Railway.

3. **Case Sensitivity**: Railway (Linux containers) is case-sensitive, while Windows is not. If you import a file with the wrong case (e.g., `import H1 from './h1'` instead of `./H1`), it works locally but fails in production.

4. **Missing Files/Modules**: If a file or module is present locally but not pushed to git, it will be missing in Railway.

5. **Node Version Differences**: Your local Node version may differ from the one used in Railway, causing subtle issues.

6. **SSR/Static Export Issues**: If you use Next.js or similar, some code may run differently in SSR/static export.

**How to fix:**
- Check your imports/exports for case sensitivity and correctness.
- Make sure all files are committed and pushed.
- Review your build logs for warnings or errors.
- Compare your local Node version to Railway’s.
- Check for missing environment variables in Railway.

If you want, I can help you audit your imports/exports or check for missing files. Let me know how you want to proceed.

---

## Railway Container & HTTP Logs (Jul 10, 2025)

You reached the start of the range → Jul 10, 2025, 3:28 PM

Starting Container

INFO  Accepting connections at http://localhost:8080

HTTP  7/10/2025 7:28:41 PM 100.64.0.2 GET /
HTTP  7/10/2025 7:28:41 PM 100.64.0.2 Returned 304 in 20 ms
HTTP  7/10/2025 7:28:41 PM 100.64.0.2 GET /assets/index-CsriduJ_.js
HTTP  7/10/2025 7:28:41 PM 100.64.0.2 Returned 304 in 7 ms
HTTP  7/10/2025 7:28:41 PM 100.64.0.2 GET /assets/react-grid-layout-DOb1n4Qm.js
HTTP  7/10/2025 7:28:41 PM 100.64.0.2 GET /assets/index-DkRl-5yX.css
HTTP  7/10/2025 7:28:41 PM 100.64.0.2 Returned 304 in 2 ms
HTTP  7/10/2025 7:28:41 PM 100.64.0.2 Returned 304 in 1 ms
HTTP  7/10/2025 7:28:41 PM 100.64.0.2 GET /assets/favicon-B_SY1GJM.ico
HTTP  7/10/2025 7:28:41 PM 100.64.0.2 Returned 304 in 2 ms
HTTP  7/10/2025 7:28:45 PM 100.64.0.2 GET /assets/index-DkRl-5yX.css
HTTP  7/10/2025 7:28:45 PM 100.64.0.2 Returned 304 in 2 ms
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 GET /
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 Returned 304 in 1 ms
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 GET /assets/index-DkRl-5yX.css
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 Returned 304 in 1 ms
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 GET /assets/index-CsriduJ_.js
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 Returned 304 in 0 ms
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 GET /assets/react-grid-layout-DOb1n4Qm.js
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 Returned 304 in 1 ms
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 GET /assets/favicon-B_SY1GJM.ico
HTTP  7/10/2025 7:34:04 PM 100.64.0.3 Returned 304 in 1 ms