# Portfolio

Personal engineering portfolio — a bilingual (EN/VI) single-page app built with React 19, TypeScript and Vite. All content is data-driven: language-neutral structure documents in `src/data/*.json`, per-language text dictionaries in `src/i18n/locales/`, joined at load. An authenticated edit mode (`?edit`) edits the live site in place and writes the documents back to the git repository through a Gitea Contents API proxy; pushing to `master` deploys through Gitea Actions CI.

Product and feature specifications: [`docs/design/spec.md`](docs/design/spec.md) and [`docs/design/specs/`](docs/design/).

## Requirements

| Tool | Version | Needed for |
|---|---|---|
| Node.js | 24 | everything (CI runs Node 24) |
| pnpm | 12 | everything (`corepack enable` or `npm i -g pnpm`) |
| Playwright Chromium | — | resume PDF generation only (`npx playwright install chromium`) |
| Docker | — | optional: run the production nginx stack locally |

## Local setup

### 1. Install

```bash
pnpm install
```

### 2. Environment

```bash
cp .env.example .env
```

`.env` is gitignored; fill it in:

| Variable | Required | Purpose |
|---|---|---|
| `SITE_URL` | for `pnpm build` | canonical origin — every published absolute URL (meta tags, sitemap, robots, resume links) derives from it. `pnpm dev` falls back to `http://localhost:5173` without it |
| `SITE_NAME` | for `pnpm build` | page `<title>` and Open Graph / Twitter meta. Dev fallback: `Portfolio (dev)` |
| `GITEA_CONTENTS_API` | optional | full Gitea Contents-API base URL (`…/api/v1/repos/<owner>/<repo>/contents/`). Enables the dev `/api/content/` proxy — the exact mirror of the production nginx location |
| `GITEA_TOKEN` | optional | Gitea access token the dev proxy attaches to write requests |

Without the two `GITEA_*` values everything still runs; edit mode is offline (bundled content, save disabled).

### 3. Run

```bash
pnpm dev        # http://localhost:5173 with HMR
```

Edit mode: open any route with `?edit` (or `?edit=<branch>` to read and write a specific branch; bare `?edit` resumes the last branch, default `master`). In dev the proxy uses `GITEA_TOKEN` directly — no login prompt.

### 4. Commands

| Command | Description |
|---|---|
| `pnpm dev` | dev server with HMR |
| `pnpm build` | `tsc -b` + production build (injects `SITE_URL` / `SITE_NAME` into `index.html`), then generates `dist/sitemap.xml` + `dist/robots.txt` |
| `pnpm preview` | preview the production build locally |
| `pnpm lint` | Oxlint |
| `pnpm validate:content` | validate the content dictionaries against the structure documents and page manifests (also runs at module load in the browser) |
| `pnpm build:resume` | generate the resume PDF (EN) |
| `pnpm build:resume-all` | generate both resume PDFs (EN + VI) |
| `pnpm build:resume-preview` | render the resume HTML preview without writing a PDF |
| `pnpm sitemap` | regenerate `dist/sitemap.xml` + `dist/robots.txt` on its own |
| `pnpm generate:ids` | regenerate `src/types/content-ids.ts` from `src/data/*.json` (also runs as `predev` / `prebuild` / `prepare`) |

Content validation is a hard gate: a malformed document fails `pnpm build`, CI, and the browser load — never a silent half-render.

Content ids are generated the same way: `src/types/content-ids.ts` is written from the structure documents and is gitignored, so adding or deleting a content record touches JSON only — never a TypeScript file. A fresh checkout gets it from `pnpm install`; `pnpm generate:ids` regenerates it on its own.

Gotcha: while a generated `dist/resume*.pdf` is open in a viewer, `pnpm build:resume-all` fails with `EBUSY` and `pnpm build` fails too (vite `emptyDir` → `EPERM`). Close the viewer first.

### 5. Run the production stack locally (optional)

To exercise the real serving path — nginx SPA routing, caching, the authenticated `/api/content/` proxy:

```bash
pnpm build
mkdir -p secrets
# secrets/site_config — exactly two lines, chmod 600, never committed:
#   GITEA_TOKEN=<token>
#   GITEA_CONTENTS_API=https://<gitea-host>/api/v1/repos/<owner>/<repo>/contents/
chmod 600 secrets/site_config
docker network create docker-network   # once; compose.yaml joins it
docker compose up -d
```

`compose.yaml` defines no published port (the VPS container is reached through its own fronting); `compose.override.yaml` — auto-merged by `docker compose`, never shipped by the pipeline — publishes the container on the local loopback. Open **`http://127.0.0.1:8081/`** in a browser; `?edit` there asks for HTTP Basic credentials from `deploy/htpasswd`. If 8081 is taken on your machine, change the host port in `compose.override.yaml`. Stop the stack with `docker compose stop`.

## Production deployment (Gitea CI)

### Pipelines

| Workflow | Trigger | What it does |
|---|---|---|
| [`.gitea/workflows/deploy.yml`](.gitea/workflows/deploy.yml) | push to `master` | `build` (validate content → `pnpm build`) → `generate-resume` (EN + VI PDFs) → `deploy` rsyncs `dist/` (PDFs included) to `/opt/stacks/dong-site/dist/` on the VPS |
| [`.gitea/workflows/deploy-infra.yml`](.gitea/workflows/deploy-infra.yml) | push to `master` touching `nginx.conf` / `compose.yaml` / `deploy/htpasswd`, or manual dispatch | rsyncs exactly those three files to the stack directory, tests the new config in a throwaway container (`nginx -t`), then `docker compose up -d --force-recreate` + health probe |

Only `master` deploys. A content commit never restarts nginx; an infra commit never rebuilds the site. The VPS stack is managed by Dockge (`/opt/stacks/dong-site`); the repository is the single source of truth for the three infra files.

### One-time setup

**1. Gitea Actions variables** — Settings → Actions → Variables (repository level):

| Name | Value |
|---|---|
| `SITE_URL` | the canonical origin, e.g. `https://cv.example.com` (no trailing slash) |
| `SITE_NAME` | the page title string |

These are public values, so they live in the `vars.` context, not secrets (spec-v4-deploy-infra D10/D12, rev.7). A production build without them fails with an error naming the variable.

**2. Deployment SSH access** — a deploy user on the VPS plus an SSH key.

On Windows (PowerShell):

```powershell
ssh-keygen -t ed25519 -C "gitea-deploy" -f "$HOME\.ssh\gitea_deploy_key"
```

On the VPS:

```bash
sudo adduser gitea-deployer
sudo usermod -aG docker gitea-deployer
sudo -u gitea-deployer docker ps          # verify docker access
sudo install -d -m 700 -o gitea-deployer -g gitea-deployer /home/gitea-deployer/.ssh
```

No `ssh-copy-id` on Windows, so copy the public key manually:

```powershell
type $HOME\.ssh\gitea_deploy_key.pub | ssh gitea-deployer@vps.example.com -p 2222 "cat >> ~/.ssh/authorized_keys"
ssh gitea-deployer@vps.example.com -p 2222 -i "$HOME\.ssh\gitea_deploy_key" -o IdentitiesOnly=yes   # test
Get-Content -Raw "$HOME\.ssh\gitea_deploy_key"   # this content becomes DEPLOY_SSH_PRIVATE_KEY
```

Then create Gitea Actions **secrets** — Settings → Actions → Secrets:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | VPS hostname / IP |
| `DEPLOY_SSH_PORT` | SSH port |
| `DEPLOY_USER` | `gitea-deployer` |
| `DEPLOY_SSH_PRIVATE_KEY` | the private key content |

**3. VPS stack config** — in the stack directory `/opt/stacks/dong-site/`, create `secrets/site_config` (chmod 600, exactly the two `KEY=value` lines shown in step 5 above). The token should be a dedicated Gitea **restricted access token** (`site-contents-write`: this repository only, Contents write, with an expiry). The pipeline never rsyncs `secrets/`, so it can never touch this file; it never appears in `docker inspect` or the Dockge env tab.

**4. Edit-mode login** — production `/api/content/` sits behind HTTP Basic (`auth_basic` + `deploy/htpasswd`, committed as hashes). The browser prompts once per session.

### Editing content in production

Open `https://<SITE_URL>/any-route?edit` (append `=<branch>` to target another branch — it must already exist; the edit UI never creates branches). Edits preview live; saving writes each touched document as its own commit through the proxy, and merging that branch into `master` deploys it via `deploy.yml`.

## Spec status (v4)

Implemented: locale dictionaries + page manifests (`spec-v4-data-organization.md`), inline editing on every record surface (`spec-v4-inline-editing.md`), live edit + save pipeline (`spec-v4-live-edit.md`), CI pipelines + env-driven site identity (`spec-v4-deploy-infra.md`, rev.7). Remaining owner-side steps are tracked in each spec's Progress Tracking section.
