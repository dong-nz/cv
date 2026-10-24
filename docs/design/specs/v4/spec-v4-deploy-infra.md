# Specification — v4 Deploy Infra (redeploy the nginx container; externalize site identity from the repo)

Status: **Design agreed 2026-10-23 (rev.8); repo side implemented 2026-10-23; owner-side setup + first verified run TODO.** Closes the manual half of `spec-v4-live-edit.md` §12 row 11 (the infra files ship with a dedicated pipeline), and per the owner's direction of 2026-10-23 removes explicit site identity (`cv.vugado.com`, `code.vugado.com`, repo path, site name) from the repository — those values become deployment-time configuration (D10–D12). Rev.2 added the Dockge reality (D7, D8); rev.3 recorded the owner's confirmed facts (`DOCKGE_STACKS_DIR=/opt/stacks`, upstream Dockge, `compose.yaml` naming) and the matching repository rename (D9, done); rev.4 added the site-identity externalization design (D10–D12); rev.5 moved `GITEA_TOKEN` off the stack `.env` to a Docker secret file after the owner verified file-based secrets work on the VPS's `docker compose` (non-swarm); rev.6 removes the stack `.env` entirely (owner: "don't use .env") — both server-side values live in ONE file, `secrets/site_config` (D13); rev.7 switches the site-identity channel from Gitea Actions secrets to Actions variables (`vars.` context — public values; owner direction 2026-10-23, `deploy.yml` job env updated); rev.8 records the first-run fixes proven by the 2026-10-23 runs and a local reproduction of the test step: three single-path rsync steps, `-R` dropped (the action prefixes `$GITHUB_WORKSPACE`), `NGINX_ENVSUBST_FILTER` as a `|`-regex (a comma form matches nothing), and a resolvable test placeholder (`http://127.0.0.1:1`) — the reproduced test step passes. Implementation landed the same day: `deploy-infra.yml`, the §4.1 `compose.yaml`, `site.ts` env read, the vite site-identity plugin + env-driven dev proxy, generated `robots.txt`, `deploy.yml` job env, `.env.example`, AGENTS.md — see §8 for what remains owner-side.

## 1. Current state

- `deploy.yml` ships `dist/` by rsync to `/opt/stacks/dong-site/dist/` on the VPS. The live container `dong-site` (compose at `/opt/stacks/dong-site/compose.yaml`) mounts `./dist`, `./nginx.conf` as an envsubst **template**, and `./deploy/htpasswd`.
- On the VPS the stack is managed by **Dockge** (upstream — confirmed by the owner 2026-10-23, so D8 applies exactly as written): the stack file is `/opt/stacks/dong-site/compose.yaml` — `DOCKGE_STACKS_DIR=/opt/stacks` confirmed — and day-to-day operations (start/stop/logs/deploy button) happen in the Dockge UI. Dockge reads the compose file from disk every time a stack is opened and its deploy action runs `docker compose` in the same directory — so a pipeline that writes those files and runs the same commands is exactly what Dockge itself would do. There is no hidden Dockge state to keep in sync.
- `nginx.conf`, `compose.yaml`, `deploy/htpasswd` are committed but **never deployed**: row 11 made them a one-time manual server step. Three editing surfaces exist (repo, manual SSH, Dockge UI) — drift is therefore possible.
- `GITEA_TOKEN` lives only in `/opt/stacks/dong-site/.env` on the VPS; `NGINX_ENVSUBST_FILTER=GITEA_TOKEN` restricts the template substitution to that variable.

## 2. Why the pipeline is Dockge-safe

Dockge is a UI over compose files on disk: it reads the stack's `compose.yaml` from the stack directory every time the stack is opened, and its deploy action runs `docker compose` in that same directory. A pipeline that writes exactly those files and runs exactly those commands is doing what the Dockge UI itself does — there is no hidden Dockge state to keep in sync.

- `rsync` writes the stack's own files in Dockge's stack directory — the same files the Dockge UI opens.
- `docker compose up -d --force-recreate` in the stack directory is the same command the Dockge deploy button runs.
- The test container (step 3) touches nothing in the stack directory.
- Verification after a pipeline run: open the stack in the Dockge UI — it shows the deployed file content and live container state. No extra tooling.

## 3. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | A **separate workflow** `deploy-infra.yml`, triggered by `push: master` + `paths: [nginx.conf, compose.yaml, deploy/htpasswd]`, plus `workflow_dispatch` for manual redeploy (the token rotation runbook needs this). `concurrency.group: deploy-infra`, independent of `group: deploy` — the dist rsync and a container restart do not collide. | An infra step inside `deploy.yml` would restart nginx on every content commit, and edit mode saves to `master` ARE content commits. The paths filter is the whole point. |
| D2 | Remote commands run through **`appleboy/ssh-action`** (pinned), reusing the existing secrets `DEPLOY_HOST` / `DEPLOY_SSH_PORT` / `DEPLOY_USER` / `DEPLOY_SSH_PRIVATE_KEY`. No new secrets. | Chosen by the owner over raw `ssh` steps; the action handles the key file and host-key checking. |
| D3 | **Test-before-touch**: validate the new template in a throwaway `docker run --rm nginx:alpine … nginx -t` on the VPS BEFORE restarting the live container; then `docker compose up -d --force-recreate`; then a health probe. | `nginx -t` against the live container only discovers a bad config after production already took it. A failed test fails the job and production keeps serving the old config. |
| D4 | Apply with **`up -d --force-recreate`**, never `nginx -s reload`, never plain `up -d`. | The config is mounted as a template: `envsubst` runs at container start. A reload would keep the previously rendered `default.conf`. Plain `up -d` does not recreate on bind-mount content changes (no config-hash change); `--force-recreate` also covers the case where the trigger was `compose.yaml` or the stack's config file itself. |
| D5 | Token-safety rules (§5). The infra workflow never sees `GITEA_TOKEN`; it is not added to Gitea Actions secrets. | The token's home stays server-side only — the stack's single config file (D13) — and the workflow never touches its value. |
| D6 | The rsync ships exactly the three triggered files, no `--delete`, never `secrets/`. | The stack's config file is server-side config (rev.6 removed the stack `.env` entirely); `--delete` in a partial rsync would risk wiping stack files. |
| D7 | **Single source of truth for the three infra files is the repository.** Production compose/config changes are made in the repo and land through the pipeline; the Dockge UI is used for observation and container operations, not for editing the stack files. | Dockge adds a third editing surface on top of repo and manual SSH. Without this rule the copies drift silently. If a change is ever made in the Dockge UI anyway, the pipeline's next run overwrites it from the repo — so commit it back to the repo first. |
| D8 | **No Dockge REST API in this design.** Upstream Dockge has no management API yet (louislam/dockge PR #973, an authenticated management API with `X-API-Key`, is an open draft as of 2026-06-21); the `finder39/dockge` fork has one. If the installed Dockge turns out to be that fork — or the PR lands upstream — the restart/health steps can later move to the API as a simplification, replacing only step 4's docker commands. | Designing against an API that does not exist upstream would block implementation on someone else's merge. |
| D9 | The repository compose file is named **`compose.yaml`** (repo root), matching Dockge's stack-file convention and the Compose spec standard name. Renamed 2026-10-23 (`git mv`); `docker compose` discovers it automatically, so local usage is unchanged. The rsync maps repo path → stack path 1:1 with no rename step. | Follow the manager's convention: one name across the repo, the stack directory, and the Dockge UI. The old name would have needed an rsync rename or a second copy on the VPS. |
| D10 | **`SITE_URL` (canonical origin) becomes a build-time environment value**, not a repo literal. Repository literals removed: `src/data/site.ts` (reads `process.env.SITE_URL` for the tsx scripts, with an `import.meta.env` fallback for any future browser importer; **unset → throw** — a production build never emits a half-configured sitemap/meta, same loud-failure rule as content validation), `index.html` (the 6 absolute-URL literals — canonical, og:url, og:image, twitter:image, JSON-LD url+image — become `%SITE_URL%` tokens filled by a ~8-line inline `transformIndexHtml` plugin in `vite.config.ts`; dev fallback `http://localhost:5173`), `public/robots.txt` (deleted — `scripts/generate-sitemap.ts` writes `dist/robots.txt` together with `dist/sitemap.xml` from the same value; the existing "index.html contains siteUrl" guard stays and now validates the injection). CI: `env: SITE_URL: ${{ vars.SITE_URL }}` on the `build` and `generate-resume` jobs of `deploy.yml` (rev.7: Actions variables — public values, not secrets; the resume template consumes `{{SITE_URL}}`). Local: uncommitted `.env`, committed `.env.example`. | The owner's rule 2026-10-23: the repo stores no explicit website identity. One value in one place (CI variable / local .env); moving the site to a new domain is a settings change, not a code change. |
| D11 | **`GITEA_CONTENTS_API` (full Contents-API base URL, incl. repo path) becomes a runtime configuration value** consumed only by the nginx container and the dev proxy — never CI, never the bundle. Repository literals removed: `nginx.conf` (`proxy_pass ${GITEA_CONTENTS_API};`, rev.6; the `proxy_set_header Host code.vugado.com` line is deleted — nginx's default `$proxy_host` for a literal proxy_pass gives the identical Host header) and `vite.config.ts:19-22` (parse `process.env.GITEA_CONTENTS_API` into proxy target + rewrite prefix; unset → no proxy → edit mode offline, identical to today's no-token behavior). `envsubst` renders at container start **before** nginx parses the config, so the rendered `proxy_pass` is a literal string — no `resolver` needed. Server home: the stack's single config file (D13); local home: the uncommitted local `.env` (vite's standard channel; the dev machine has no Dockge UI). `NGINX_ENVSUBST_FILTER=GITEA_TOKEN|GITEA_CONTENTS_API` stays a plain env var in compose — it names variables to substitute, it is not itself sensitive. [rev.8: the filter is a **regex** the official entrypoint matches against each variable name — alternatives MUST be separated with `|`; the original comma form matched nothing and left the `${…}` tokens in the rendered config.] | The Gitea host + `dong.nguyen/cv` path is infrastructure, not product — today it appears in `nginx.conf:50,52` and `vite.config.ts:19-22`, so the dev proxy drifts from production by hand; after this both read the same value. The URL is public, so its secret-file home is about **placement** (outside the repo, outside the Dockge env tab), not confidentiality. |
| D12 | **`SITE_NAME` (the `<title>`/og:title/twitter:title string) also becomes an env value.** The three `index.html` literals become `%SITE_NAME%` tokens filled by the same plugin; `site.ts`'s `siteName` export (currently **dead** — no consumer in the repo) is kept as the config module's typed accessor for the plugin and scripts. Known duplication recorded: the same person string exists in the content dictionaries (`profile.name` + `profile.title`); meta tags are build-time single-language chrome while content is runtime per-language, so v1 accepts the duplication and the env value. A future single-source option (compose the title from the documents at build time) is a follow-up, not part of this change. | Owner chose "Gồm cả siteName" 2026-10-23. Leaving the name in the repo while the URL moves out would half-solve the stated goal. |
| D13 | **The stack's runtime config is ONE server-side file, not `.env`, not multiple files** (owner direction 2026-10-23: "don't use .env", "use only one file"). `compose.yaml`: `secrets: [site_config]` with `secrets.site_config.file = ./secrets/site_config` (stack directory, chmod 600, owner-side, gitignored), a dotenv-format file holding exactly `GITEA_TOKEN=…` and `GITEA_CONTENTS_API=…` (shell-safe values: hex token, URL — no spaces/quotes). The entrypoint sources it before the official entrypoint renders: `entrypoint: ["sh", "-c", "set -a; . /run/secrets/site_config; exec /docker-entrypoint.sh nginx -g 'daemon off;'"]` — `set -a` is required (a sourced assignment is a shell variable; without export the entrypoint child and its envsubst step see nothing), and the nginx command is written inline because a compose entrypoint override does not keep the image's CMD (`CMD=[]`; an empty `$@` makes the exec a no-op → exit 0 → restart loop). Both proven by a local run 2026-10-23; the original `$$@` form and its rationale were wrong. The full target file is §4.1. The stack directory has **no `.env` at all**; no sensitive value appears in compose's `environment:`. File-based secrets under plain `docker compose` (non-swarm) were verified on the VPS 2026-10-23. | Env vars appear in plaintext in the Dockge env editor and in `docker inspect`; a sourced secret file appears in neither (only its path is visible). Startup stays unattended: the file is read at container start, no human key (an "encrypted .env + key" scheme would break pipeline/boot recreations, which have no one to type the key). One file = one rotation surface, one rsync exclusion, one drift candidate. The only remaining plaintext is the rendered `default.conf` inside the container's writable layer — never bind-mounted, never on the host. |
| D14 | **`/api/content/` proxies to Gitea over HTTP/2** (`proxy_http_version 2` + `proxy_set_header Connection "";`, `nginx.conf:51-60`, 2026-10-24). Measured 2026-10-24: `code.vugado.com` and `cv.vugado.com` both complete an ALPN h2 handshake and answer 200 (`server: openresty`); neither advertises `Alt-Svc`, so HTTP/3 is not offered to browsers and is not pursued. The stack's container is nginx 1.31.6 (owner-confirmed): HTTP/1.1 to upstreams **and** upstream keepalive caching (`keepalive 32 local`) are the defaults since 1.29.7, so connection reuse needs no `upstream` block — the first draft of this change (a named `upstream` + a `${GITEA_HOST}` derived from `GITEA_CONTENTS_API` in the entrypoint) was dropped because it would move the Gitea repo path back into `nginx.conf`, against D11. `proxy_http_version 2` exists since 1.29.4 and requires `ngx_http_v2_module` in the image: if the image lacks it, the test-before-touch `nginx -t` step fails and production is never touched (D3), and the fallback is simply to drop the two lines, since HTTP/1.1 + keepalive is already this container's default behavior. | Pairs with `spec-v4-live-edit.md` row 25: the client now issues its 14 reads as one concurrent wave. Over HTTP/1.1 a concurrent wave costs one upstream connection per in-flight request; over HTTP/2 they are streams on a single pooled connection. |

Env surface (the whole contract): `SITE_URL` + `SITE_NAME` = Gitea Actions **variables** (`vars.` context) on the `build`/`generate-resume` jobs — revised 2026-10-23: these are public values, so Gitea's variables mechanism is the correct channel (secrets are for sensitive values; masked secrets also made a missing/empty `SITE_URL` undiagnosable in logs); `GITEA_TOKEN` + `GITEA_CONTENTS_API` = the stack's single config file `secrets/site_config` (D13; never in `.env`, never in the repository, never in CI, never in the bundle). Local development: an uncommitted local `.env` (vite's standard channel) carries the runtime values; `.env.example` is committed with all four names (`SITE_URL`, `SITE_NAME`, `GITEA_TOKEN`, `GITEA_CONTENTS_API`) and no values.

## 4. Workflow contract (design, not yet the final YAML)

```
name: Redeploy Nginx
on:
  push: { branches: [master], paths: [nginx.conf, compose.yaml, deploy/htpasswd] }
  workflow_dispatch:
concurrency: { group: deploy-infra, cancel-in-progress: false }

jobs:
  redeploy:
    steps:
      1  actions/checkout
         2  burnett01/rsync-deployments x3 — switches: -avz (no --delete, no -R)
            path: nginx.conf / compose.yaml / deploy/htpasswd — one step per file
            remote_path: <dockge stack dir>/dong-site/ for the first two, <dockge stack dir>/dong-site/deploy/ for htpasswd   (existing DEPLOY_* secrets)
            (The action builds the rsync source as "$GITHUB_WORKSPACE/$path" and passes it as one argument — entrypoint.sh. A comma-list therefore fails as one literal filename, and --relative/-R mirrors the absolute workspace path onto the server; both proven on the 2026-10-23 runs.)
      3  appleboy/ssh-action — script:
         cd <stack dir>/dong-site
         docker run --rm \
           -v "$PWD/nginx.conf:/etc/nginx/templates/default.conf.template:ro" \
           -v "$PWD/deploy/htpasswd:/etc/nginx/htpasswd:ro" \
           -e GITEA_TOKEN=placeholder \
           -e GITEA_CONTENTS_API=http://127.0.0.1:1 \
           -e 'NGINX_ENVSUBST_FILTER=GITEA_TOKEN|GITEA_CONTENTS_API' \
           nginx:alpine nginx -t
      4  appleboy/ssh-action — script:
         cd <stack dir>/dong-site
         docker compose up -d --force-recreate dong-site
         sleep 2
         docker exec dong-site wget -q -O /dev/null http://127.0.0.1/   # alpine nginx has no curl
         docker exec dong-site nginx -t
         On failure: docker logs --tail 50 dong-site  (and fail the job)
```

Notes:
- The test container renders the template with **pure placeholders on the command line** — `nginx -t` validates syntax only. It mounts the template and the htpasswd file (`-t` opens `auth_basic_user_file`); it reads no config file and no secrets: the real values never enter the test container or the job. [Resolved on the 2026-10-23 runs + a local reproduction of this exact step: (1) the comma-separated `path` input reaches rsync as ONE quoted literal filename → three single-path steps; (2) the action prepends `$GITHUB_WORKSPACE` to `path`, so `-R` mirrored the absolute workspace path onto the VPS → plain `-avz` + per-step `remote_path`; (3) `NGINX_ENVSUBST_FILTER` is a regex matched against variable names — the comma form substituted nothing and `nginx -t` failed `unknown "gitea_contents_api" variable` → `|`-separated (quoted in the shell script); (4) a literal hostname in `proxy_pass` IS resolved during the config test — the placeholder must be a resolvable literal IP (`http://127.0.0.1:1`), not `http://placeholder`. With all four fixed the reproduced test step passes (`exit 0`).]
- The health probe uses `wget` (busybox) because `nginx:alpine` carries no curl.
- Restart gap is ~1–2 s (single container). Accepted for a personal site; a two-container swap is explicitly out of scope.
- `on.push.paths` is evaluated by the act runner — assumed supported on this Gitea [INFERENCE: verify on the first real run — the first run did execute after the push that touched the three files; confirm the trigger event label in the Actions UI to close this]. Fallback if the filter is ignored: a first step that diffs `$GITHUB_BASE_REF..$GITHUB_SHA` (or the head commit) against the trigger paths and exits early.

### 4.1 Target `compose.yaml` — the complete final file (design contract, not yet applied)

The repo copy == the stack-directory copy (D7, D9). Diff vs today's file: delete `GITEA_TOKEN: ${GITEA_TOKEN}` from `environment:` (that line is the only compose interpolation today, and it is what makes the value visible in `docker inspect` and the Dockge env tab); add the entrypoint override and the secrets block.

```yaml
# Repo-as-source-of-truth copy (deploy-infra spec D7/D9): rsynced to the stack
# directory and run there by the pipeline or Dockge. Runtime values live in
# secrets/site_config, which is NOT in the repository — the repo carries no
# site identity (D10-D13).
services:
  dong-site:
    image: nginx:alpine
    container_name: dong-site
    restart: unless-stopped
    # Source the config file, then hand over to the image's official entrypoint.
    # set -a exports the sourced assignments (a sourced `KEY=value` is a shell
    # variable only — the entrypoint child and its envsubst step would otherwise
    # see nothing); the nginx command is inline because a compose entrypoint
    # override drops the image's CMD (CMD=[]) — an empty "$@" exits 0, restart loop.
    entrypoint: ["sh", "-c", "set -a; . /run/secrets/site_config; exec /docker-entrypoint.sh nginx -g 'daemon off;'"]
    environment:
      # Names the variables the template renderer substitutes, so $uri/$host
      # stay nginx runtime variables. The filter is a REGEX matched against
      # variable names — alternatives separated with | — and not sensitive.
      NGINX_ENVSUBST_FILTER: GITEA_TOKEN|GITEA_CONTENTS_API
    volumes:
      - ./dist:/usr/share/nginx/html:ro
      # Mounted as a template: the image's envsubst step renders it to
      # /etc/nginx/conf.d/default.conf with the variables sourced above.
      - ./nginx.conf:/etc/nginx/templates/default.conf.template:ro
      - ./deploy/htpasswd:/etc/nginx/htpasswd:ro
    secrets:
      - site_config
    networks:
      - docker-network

secrets:
  site_config:
    file: ./secrets/site_config
```

`secrets/site_config` (stack directory, chmod 600, gitignored via `.gitignore` += `secrets/`), exactly two lines:

```
GITEA_TOKEN=<restricted write token>
GITEA_CONTENTS_API=https://<gitea-host>/api/v1/repos/<owner>/<repo>/contents/
```

- Same file path and format on the VPS and locally: local `docker compose up` for the nginx test needs the same `secrets/site_config` created locally (gitignored); vite keeps reading the local `.env` (D11) — both local files hold the same two values, neither is committed.
- No top-level `name:` key: the stack directory already defines the compose project name (matches today's live behavior — do not add one).
- Validation before the first run: `docker compose config --quiet` (run by hand, never inside the infra job — it interpolates).

## 5. Token security (answers "how to secure the Gitea token?")

1. **Single home.** `GITEA_TOKEN` lives only in the stack's config file `secrets/site_config` (chmod 600, deploy-user owned; D13), mounted by compose as `/run/secrets/site_config` and sourced at container start by the entrypoint override. Never in the repository, never in any `.env`, never in Gitea Actions secrets, never in the SPA bundle, never in workflow logs.
2. **Least scope.** A dedicated Gitea **restricted access token** (not the owner's personal token): repository `dong.nguyen/cv` only, Contents write only, named `site-contents-write`, with an expiry (6 months) so rotation is scheduled, not optional.
3. **Transport.** Browser → nginx `/api/content/` (HTTP Basic, `deploy/htpasswd` — SHA-512 crypt hashes, committed; hashes not plaintext) → nginx adds `Authorization: token ${GITEA_TOKEN}` server-side (`nginx.conf:53`) → Gitea over HTTPS. The browser never sees the token; the rendered `default.conf` contains it but the file never leaves the container.
4. **No-leak rules for the infra workflow:** never rsync `secrets/`; pass env via placeholders or `--env-file`, never `-e GITEA_TOKEN=$GITEA_TOKEN`; never `cat`/source the config file, run `docker compose config`, or `docker exec … env` inside the job (all print interpolated values); no `set -x` around lines that touch the stack config.
5. **Rotation runbook:** create the new restricted token in Gitea → overwrite the `GITEA_TOKEN=` line in the stack's `secrets/site_config` on the VPS → run `deploy-infra` via `workflow_dispatch` (it recreates the container cleanly and health-checks it) → revoke the old token. This is why `workflow_dispatch` is part of D1. The config file is intentionally NOT in the workflow's paths filter: config edits must not auto-trigger a redeploy by themselves; the dispatch IS the deploy step.

## 6. Risks

- **Stack drift (blocks the first run):** row 11 applied the config manually on the server, and the Dockge UI is a third editing surface (D7). Before enabling the workflow, diff the stack directory's `nginx.conf` / `compose.yaml` / `htpasswd` against the repo copies; the first run overwrites the server with the repo versions. Note the VPS stack file is already named `compose.yaml` (D9) — the repo rename lands on the same name, no server-side rename is needed. (Owner-side check; no repo access from CI to the VPS.)
- **Paths filter support** on the act runner [INFERENCE — first run executed after a push touching the three files; confirm the trigger label in the Actions UI] — fallback in §4.
- A bad `compose.yaml` pushed to master recreates the container with the bad definition; the health probe catches it, and rollback = revert the commit + dispatch again.
- **Missing config file:** if `secrets/site_config` does not exist in the stack directory, `docker compose up` fails with a "secret … not found" error — caught at step 4, live container untouched. Mitigation: §8 row 3 creates the file before the first run; D6 never rsyncs `secrets/`, so the pipeline can never delete it.
- **Port exposure (open question, owner-side check):** neither the repo `compose.yaml` (old or new) nor the live manual definition was ever verified to publish a host port — the workflow's health probe runs INSIDE the container (`docker exec … wget 127.0.0.1`), so the spec never pinned how the site reaches the internet. Confirm before the first green run: `docker inspect dong-site --format '{{json .HostConfig.PortBindings}}'` on the VPS. If the live container carries a binding (e.g. `"80/tcp":[{"HostIp":"","HostPort":"80"}]`), the repo-based recreate would drop it and the site goes down externally — the binding then belongs in the stack definition (resolving the D7 nuance: publish ports are host-topology config, like the fronting TLS). If the site is fronted by another proxy container on `docker-network`, nothing changes. Local verification meanwhile: `compose.override.yaml` (auto-merged by `docker compose`, never rsynced by the pipeline) publishes `127.0.0.1:8081` — verified 2026-10-23: built site + the 401-protected `/api/content/` proxy served through the published port.

## 7. Acceptance criteria

- [ ] A change to `nginx.conf` on master triggers ONLY `deploy-infra` (no site rebuild, no resume job).
- [ ] A content-only commit triggers `deploy.yml` only — no nginx restart.
- [ ] First real run: test container passes, container recreates, health probe 200, `?edit` probe authenticates through the proxy.
- [ ] After a pipeline run, opening the stack in the Dockge UI shows the synced file content and a healthy container (no split-brain between pipeline state and Dockge view).
- [ ] A deliberately broken `nginx.conf` fails the job at the test step; the live site keeps serving the previous config.
- [ ] `workflow_dispatch` re-runs the pipeline end-to-end (token rotation runbook).
- [ ] No workflow log contains the token or any env-interpolated output.
- [ ] No runtime source file (`src/`, `scripts/`, `index.html`, `nginx.conf`, `vite.config.ts`, `public/`) contains `vugado` or the repo path — grep-clean except `dist/` output and historical docs.
- [ ] `pnpm build` without `SITE_URL` fails with the explicit error naming the variable; with it, `index.html`, `dist/robots.txt`, `dist/sitemap.xml`, and both resume PDFs carry the injected origin/name — all from one value.
- [ ] `pnpm dev` without any env still boots (localhost fallback meta, no `/api/content/` proxy → edit mode offline); with `.env` filled, edit mode works exactly as today.
- [ ] The rendered production `default.conf` equals today's hand-written block byte-for-byte given the same `GITEA_CONTENTS_API` value (assert with `docker exec dong-site cat /etc/nginx/conf.d/default.conf` on the first run).
- [ ] The stack directory contains no `.env` (rev.6); `docker inspect dong-site` and the Dockge env tab show no `GITEA_TOKEN`/`GITEA_CONTENTS_API` values (D13); the only plaintext token is inside the container's rendered `default.conf`.

## 8. Progress Tracking

| # | Task | Status |
|---|---|---|
| 0 | Design agreed (D1–D9, rev.3 owner facts confirmed) | ✅ Done 2026-10-23 |
| 1 | Owner-side confirmations: stack path `/opt/stacks` ✅, upstream Dockge ✅, stack-file name `compose.yaml` ✅ (all confirmed 2026-10-23); remaining: stack-vs-repo drift diff (§6) | 🟡 TODO — drift diff blocks the first run |
| 1b | Rename `docker-compose.yaml` → `compose.yaml` (D9) + AGENTS.md references | ✅ Done 2026-10-23 — `git mv`; `docker compose config --quiet` validates (only the expected local `GITEA_TOKEN`-unset warning) |
| 2 | `.gitea/workflows/deploy-infra.yml` per §4 | ✅ Done 2026-10-23 — checkout → three single-path rsync steps (-avz, per-step remote_path; htpasswd → …/dong-site/deploy/) → test container (placeholders + htpasswd mount) → recreate + wget/nginx -t probe; appleboy/ssh-action pinned v1.2.0. Run fixes 2026-10-23: comma-list `path` failed (single quoted argument) → three steps; `-R` + the action's workspace-prefixed source mirrored `workspace/dong.nguyen/cv/…` onto the VPS → `-R` dropped |
| 3 | Restricted Gitea token `site-contents-write` (Contents write, expiry) + create stack `secrets/site_config` (chmod 600, two KEY=value lines) | ⬜ TODO — owner-side |
| 4 | First verified run + acceptance §7 | 🟡 Runs 2026-10-23: run 1 failed at rsync (comma-list), nothing shipped; run 2 shipped to the wrong places (workspace mirror; `deploy/htpasswd` landed as a directory); run 3 failed at the test step (`NGINX_ENVSUBST_FILTER` comma form → unsubstituted `${…}` → `unknown "gitea_contents_api" variable`); the recreated container then restart-looped (compose entrypoint override drops the image CMD → empty `$@` → exit 0; and a sourced `KEY=value` is not exported → envsubst sees nothing). All causes fixed and **verified locally end-to-end**: the exact test-step container passes `nginx -t`, and a full local `docker compose up` brought the stack Up — probe 200, rendered `default.conf` carries the real values, `nginx -t` in-container OK. Owner-side: clean the stray `workspace/` dir, keep `deploy/htpasswd` a FILE, create `secrets/site_config` if missing — the push of the fixed `compose.yaml` auto-triggers the pipeline |
| 5 | Docs: AGENTS.md Deployment table + live-edit §12 row 11 status | ✅ Done 2026-10-23 |
| 6 | D10–D12 implementation: `site.ts` env read, `index.html` tokens + vite plugin, robots generation, `nginx.conf` variables, `vite.config.ts` env proxy, `deploy.yml` env, `.env.example`, AGENTS.md | ✅ Done 2026-10-23 — verified: `pnpm build` with `.env` filled emits injected meta + `dist/robots.txt`; `SITE_URL=` empty fails with the named-variable error; runtime files grep-clean of `vugado` |
| 9 | D13 implementation: `compose.yaml` per §4.1 (secret `site_config` + entrypoint override), `.gitignore` += `secrets/`; VPS: create `secrets/site_config`, delete stack `.env` | 🟡 Repo side Done 2026-10-23, entrypoint corrected the same day (`set -a` + inline nginx command — the `$$@` form restart-looped, proven locally; full local stack verified Up + probe 200); owner-side file + stack `.env` removal TODO |
| 7 | Owner-side: Gitea Actions **variables** `SITE_URL`, `SITE_NAME` (rev.: switched from secrets 2026-10-23 — public values belong in the `vars.` context); local `.env` from `.env.example` | 🟡 Local `.env` created 2026-10-23 (values known; `GITEA_TOKEN` left as shell env as before); Gitea variables TODO — owner-side |
| 10 | D14 implementation: HTTP/2 upstream for `/api/content/` | ✅ Repo side Done 2026-10-24 — `nginx.conf:51-60` (`proxy_http_version 2` + `proxy_set_header Connection ""`), `proxy_pass ${GITEA_CONTENTS_API}` untouched. The env contract is unchanged: the template still references only `${GITEA_TOKEN}` and `${GITEA_CONTENTS_API}` (grep-verified), so `NGINX_ENVSUBST_FILTER` in `compose.yaml:25` and in the workflow's test step need no edit, and `compose.yaml` / `deploy/htpasswd` are not touched. Not checkable on the dev machine (no nginx binary, Docker daemon off) — the acceptance check is the pipeline's own test-before-touch step plus a live edit-mode load. ⬜ CI: the next `deploy-infra` run — its throwaway `nginx -t` is what proves the image accepts `proxy_http_version 2` (if it does not, D14's fallback is to drop the two lines); then `docker exec dong-site nginx -t` and an edit-mode load on the deployed site |
