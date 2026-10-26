# Spec v6 — GitHub Actions

> **Parent:** `specs/v4/spec-v4-deploy-infra.md` (the pipeline design this one keeps), `specs/v4/spec-v4-live-edit.md` (the write path this one re-targets)
> **Status:** rev.1 — repo side implemented 2026-10-26 (§7), automated checks pass (§8); the owner-side setup and the first verified run are open (§6).
> **Supersedes:** the CI-host legs of `spec-v4-deploy-infra.md` — the `vars.` env surface (§3 "Env surface"), D5's "not added to Gitea Actions secrets", D14's Gitea-only host claim — and the Contents-API status codes recorded in `spec-v4-live-edit.md` §6.1. Everything else in those specs (D1–D4, D6–D9, D11–D13, the token-safety rules, the Dockge-safety argument) stands unchanged.

---

## 1. What moved, and what did not

The repository moves to GitHub. GitHub Actions is the only CI that runs on a GitHub repository, so both pipelines move with it.

Nothing about the site's runtime changed: the same nginx container on the same VPS, served by the same Dockge stack, deployed by the same rsync. The three-job pipeline, the concurrency group, the infra trigger filter, the test-before-touch step and the health probe are ported unchanged.

What does change is one thing the pipeline was never separate from: the repository **is** the content store. Edit mode commits 12 JSON documents through the nginx `/api/content/` proxy into that repository, so moving the repository re-targets the write path, and the write path is the part that needed real changes.

## 2. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | GitHub is the primary host for the repository; Gitea is retired. | GitHub Actions cannot run on a Gitea repository. A Gitea-primary + GitHub-mirror split would have kept edit mode untouched but would have made every deploy wait for the mirror's sync interval — the deployed site would lag the content the owner just saved. |
| D2 | Site hosting stays: VPS + nginx + Dockge, `rsync` deploy. | The edit-mode security boundary is `auth_basic` at the nginx `/api/content/` proxy (spec-v4-live-edit §6.3). A static host without a server-side proxy removes that boundary, so it removes edit mode. |
| D3 | Site identity stays a CI value: `SITE_URL` / `SITE_NAME` as **GitHub repository variables**, read through the same `vars.` context. | GitHub's variables mechanism is the same feature with the same context name — no YAML change, and public values still do not become secrets (spec-v4-deploy-infra rev.2 reasoning holds). |
| D4 | The runtime write-path values are renamed `GITEA_TOKEN` / `GITEA_CONTENTS_API` → **`CONTENT_API_TOKEN` / `CONTENT_API_BASE`**, and the upstream Authorization header becomes `Bearer`. | A name that names a host the system no longer calls is a lie in three files and two docs. `token <x>` was Gitea's form; `Bearer` is what the GitHub Contents API documents. `vite.config.ts` sends the identical form, so dev and production cannot diverge on the one header that decides whether a save authenticates. |
| D4a | The `proxy_pass ${CONTENT_API_BASE}` construction is **not** changed. | `NGINX_ENVSUBST_*` runs in the image's entrypoint, which renders the template **before nginx parses it**. Nginx never sees a variable here: it sees a literal upstream URL, which is why the location-prefix → directive-URI mapping works today and why `nginx -t` resolves the placeholder host during the config test. Only the value and the header change. |
| D5 | `src/i18n/draft.ts` learns GitHub's conflict answer: **409 Conflict**. The Gitea answers (422 + "does not match", legacy 412) stay handled. | Verified against the GitHub REST docs: `PUT /repos/{o}/{r}/contents/{path}` answers 409 for a stale blob `sha`, and 422 when `sha` is missing for an existing file. Without 409 a concurrent edit would be reported as a hard failure and would stop the sequential-PUT sequence — the exact case optimistic concurrency exists to survive. |
| D5a | **Non-goal, decided:** no retry/backoff for GitHub's secondary rate limits (403/429). | The measured shape of this workload — 14 GETs per edit-mode page load, 2–4 PUTs per save — is orders of magnitude under 100 concurrent requests, 900 points/min and 80 content-creating requests/min (GitHub's published secondary limits). Adding backoff would be code for a case the site does not produce. If a real run ever reports it, the retry belongs in `saveDraft`, not in the caller. |
| D6 | Pipeline shape unchanged: `build` → `generate-resume` → `deploy`, three jobs, same artifacts, same `concurrency`. Triggers stay narrow (`push: master`, `paths:` filter, `workflow_dispatch`). | The split is what makes a content error unable to deploy, and it is proven. Narrow triggers matter more now than they did: the repository is public, and a `pull_request` trigger would run a fork's YAML on this repo's runner with this repo's secrets. |
| D7 | `master` stays the deployment branch. **No branch protection on `master`.** | Edit mode PUTs straight to the target branch (default `master`). A required-PR protection makes every save fail. Renaming the branch to `main` would touch `edit-session.ts`, both workflows, the VPS and four documents for no behavioural gain. |
| D8 | GitHub-hosted runners, **public** repository. | GitHub Actions usage is free for public repositories on standard runners and free for self-hosted runners; a private repository would bill minutes against a monthly quota for a pipeline that installs pnpm twice and renders two PDFs. Accepted consequence: the content JSON and the commit history are public. |
| D9 | `.gitea/workflows/` is kept until the first GitHub run is verified, then deleted. | Owner's call: see the pipelines run green on GitHub before cutting the old ones. This is a scheduled deletion recorded as an open item (§8), not a compatibility shim — nothing reads them once GitHub is the primary. |
| D15 | The two server-side layout values the workflows hard-coded — the stack directory (5 call sites) and the service/container name `dong-site` (4 call sites) — become the **repository variables** `STACK_DIR` and `CONTAINER_NAME`; the job that uses each refuses a bad value in its first step. | Both describe the server's deployment layout, not repository content — the same class of value as `SITE_URL`: public, therefore a variable and not a secret. As literals they made a stack rename a multi-file YAML edit plus a docs sweep, and a typo would have rsynced `dist/` into the wrong directory or probed the wrong container. `CONTAINER_NAME` is checked against `compose.yaml` in the same step, because that one string is used twice over — as a compose service argument and as the `docker exec` / `docker logs` target — while the file declaring both lives in this repository. Guarding it first means a bad value fails the way the site-identity check fails: at once, naming the variable and where to set it. Recorded sequence: the owner asked for the path first and the name in the same session, so the name moved too rather than staying a literal. |

## 3. Facts verified during the review (method recorded)

| Claim | How it was checked |
|---|---|
| `pnpm/setup@v3` is the official GitHub action (`github.com/pnpm/setup`), and its `install` input defaults to `true` | Read `pnpm/setup`'s `action.yml`. This is why the `build` job has no explicit `pnpm install` step and why porting it needs no change. |
| Every other action in both workflows is published on GitHub | `actions/checkout@v7`, `actions/cache@v4`, `actions/upload-artifact@v7`, `actions/download-artifact@v8`, `burnett01/rsync-deployments@v9`, `appleboy/ssh-action@v1.2.0` — Gitea Actions was already fetching these from GitHub. |
| `vars.` and `secrets.` contexts map 1:1 | GitHub repository variables / secrets, same context syntax. |
| `concurrency`, `on.push.paths`, `workflow_dispatch` behave as written | GitHub supports all three natively; the `[INFERENCE]` recorded in `spec-v4-deploy-infra.md` §4 about `paths` filtering is closed — GitHub filters branches AND paths literally. |
| `api.github.com` answers HTTP/2, so D14 (`proxy_http_version 2`) survives the move | Ran a Node `http2` client against `https://api.github.com` from this machine: ALPN negotiated h2 and a response arrived on the HTTP/2 session (403, unauthenticated). |
| GitHub Contents API request/response shape equals Gitea's | Read the GitHub REST docs for `Get repository content` and `Create or update file contents`: `?ref=` on GET, `branch` + blob `sha` in the PUT body, `{content:{sha}}` in the response, endpoints must be used serially, no branch creation. |
| GitHub's conflict status is 409; 422 also answers "sha must be provided" and "endpoint spammed" | Same docs page, status-code list. |
| Secondary rate limits are far above this workload | GitHub's published limits: ≤100 concurrent requests, ≤900 points/min (a PUT is 5 points), ≤80 content-generating requests/min and ≤500/hour. |
| CI minutes are free for public repos and for self-hosted runners | GitHub Actions billing docs. |
| No Gitea-only syntax existed in either workflow | Read both files end to end. |
| `dong-nz/cv` exists, is public, defaults to `master`, carries no branch protection, and already holds the same 8 refs as the Gitea remote (same shas) — with **no tags** and no `.github/workflows/` yet | `GET /repos/dong-nz/cv` → `private: false`, `default_branch: "master"`; `GET /repos/dong-nz/cv/branches` → 8 branches, every one `protected: false`, shas equal to `git for-each-ref refs/remotes/origin`; `GET /repos/dong-nz/cv/tags` → empty; `GET /contents/.gitea/workflows/deploy.yml?ref=master` → 200 while the same path under `.github/` → 404, i.e. the migration commit is not pushed yet. Checked 2026-10-26. |

## 4. Env surface (the whole contract)

| Value | Home | Consumers |
|---|---|---|
| `SITE_URL`, `SITE_NAME` | GitHub **repository variables** (`vars.`), passed as job env to `build` and `generate-resume` | the vite site-identity plugin, `src/data/site.ts`, `generate-sitemap.ts`, `generate-resume.ts` |
| `STACK_DIR` | GitHub **repository variables** (`vars.`) — the absolute stack directory as the deploy user sees it, **no trailing slash** | the `deploy` job's `remote_path`, the infra job's three `remote_path`s and both `appleboy/ssh-action` scripts; the guard step in each job |
| `CONTAINER_NAME` | GitHub **repository variables** (`vars.`) — the compose service name and the container name, which `compose.yaml` declares as one and the same | the infra job's `docker compose up -d --force-recreate`, `docker exec` ×2 and `docker logs`; the guard step, which greps `compose.yaml` for both declarations |
| `DEPLOY_HOST`, `DEPLOY_SSH_PORT`, `DEPLOY_USER`, `DEPLOY_SSH_PRIVATE_KEY` | GitHub **secrets** | the rsync step, both `appleboy/ssh-action` steps |
| `CONTENT_API_TOKEN`, `CONTENT_API_BASE` | the stack's single config file `secrets/site_config` (chmod 600, server-side, never committed, never in CI) | the nginx container's envsubst template step; locally the uncommitted `.env`, read by `vite.config.ts` |
| `NGINX_ENVSUBST_FILTER=CONTENT_API_TOKEN\|CONTENT_API_BASE` | `compose.yaml` | the official entrypoint's template renderer (a regex over variable **names**; alternatives separated with `\|`) |

The token's rules are unchanged from `spec-v4-deploy-infra.md` §5: single home, least scope (a dedicated restricted write token, now a GitHub fine-grained PAT with `Contents: Read and write` on this repository only, named `site-contents-write`, expiring), never in the repository, never in CI secrets, never in the bundle, never printed by the infra workflow. The token's provider changed; its containment did not.

`CONTENT_API_BASE` is the full Contents-API base including the repository path — for this repository: `https://api.github.com/repos/dong-nz/cv/contents/`.

`STACK_DIR` carries no trailing slash because the workflows append `/dist/`, `/` and `/deploy/` themselves; the guard rejects a trailing slash so a doubled one cannot reach rsync. `CONTAINER_NAME` is the single string `compose.yaml` declares twice — the service key `dong-site:` and `container_name: dong-site` — and the infra job uses it in both roles (`docker compose up -d --force-recreate <name>`, then `docker exec` / `docker logs <name>`), so the guard greps the checked-out `compose.yaml` and refuses a value matching neither. A stack rename is then: change `compose.yaml` in a commit, change the two variables — and the pipeline names the disagreement if the two are out of step.

## 5. Migration runbook — the order is part of the design

1. Push the repository to GitHub (`master`).
2. Create the GitHub variables and secrets (§4), and the fine-grained write token.
3. **Update `/opt/stacks/dong-site/secrets/site_config` on the VPS first** — both new names with the GitHub values. This must precede step 4: the migration commit touches `nginx.conf` and `compose.yaml`, so the infra workflow runs in the same push, and `--force-recreate` (D4 of the infra spec) restarts the container with the config the file just supplied. A config file still carrying the old names renders `${CONTENT_API_BASE}` unsubstituted, nginx fails to start, the health probe fails, and the site is down until the file is fixed. Nothing else in the sequence has that property.
4. Merge the migration commit → `build` + `generate-resume` + `deploy` run on GitHub. The live site is untouched by this step: `deploy.yml` rsyncs `dist/` only.
5. `deploy-infra.yml` runs in the same push (or by `workflow_dispatch`): rsync the three infra files → `nginx -t` in a throwaway container with placeholders → recreate → health probe.
6. Smoke the write path: `curl` GET and PUT through `/api/content/` with the Basic credentials, confirm the commit lands on GitHub and the pipeline deploys it; then one real save from `?edit`.
7. Verify a conflict once: two saves against the same document, or an out-of-band commit to `master` between a read and a save. The second must report a conflict with a rebase offer, not a failure.
8. Delete `.gitea/workflows/` (D9) and archive the Gitea repository.

## 6. Open items (owner-side)

- [x] GitHub repository created, `master` pushed. Verified 2026-10-26 through the GitHub API (§3): `dong-nz/cv`, public, `default_branch: master`, 8 refs at the same shas as the Gitea remote. **The migration commit is not pushed yet** — `.github/workflows/` returns 404 on `master` there.
- [x] No branch protection on `master` — verified: every branch reports `protected: false`. Standing invariant, not a one-time check: required-PR protection would make every edit-mode save fail (D7).
- [ ] Fine-grained PAT `site-contents-write`: this repository only, `Contents: Read and write`, expiry set. Until it exists and is pasted into `secrets/site_config`, the write path is inert everywhere: the proxy sends an empty `Bearer`, GitHub answers 401, and the app falls back to the visitor site.
- [ ] VPS `/opt/stacks/dong-site/secrets/site_config` rewritten with the two new names and the GitHub base, chmod 600 — **before** the migration commit lands (§5 step 3).
- [ ] Restore `- master` in both workflow triggers. Both files currently trigger on `feature/github-migration` (a temporary test trigger, set 2026-10-26); until this is closed, merging into `master` deploys nothing (D6).
- [ ] Push the tag: `git push github v0.0.1` — the mirror carried branches but no tags.
- [ ] Repository variables `SITE_URL`, `SITE_NAME`; secrets `DEPLOY_HOST`, `DEPLOY_SSH_PORT`, `DEPLOY_USER`, `DEPLOY_SSH_PRIVATE_KEY`. Without the variables `build` fails at the identity check; without the secrets the rsync and recreate steps fail while the infra test-before-touch step still passes.
- [ ] Repository variables `STACK_DIR` (absolute stack directory, `/opt/stacks/dong-site`, no trailing slash) and `CONTAINER_NAME` (`dong-site`, matching `compose.yaml`). Both jobs stop at their first step without them.
- [ ] VPS accepts SSH from GitHub-hosted runners (the old runner may have reached the host from the same machine or LAN; GitHub runners come from GitHub's published IP ranges).
- [ ] First `deploy.yml` and `deploy-infra.yml` runs observed green; §5 steps 6–7 verified.
- [x] Local config renamed (untracked files, done 2026-10-26): `.env` carries `SITE_URL`, `SITE_NAME`, `CONTENT_API_BASE` with the GitHub base, token still supplied as a shell variable; `secrets/site_config` carries the two new names with the token left empty. With the old names in either file the local stack cannot render nginx (`${CONTENT_API_BASE}` stays unsubstituted) and `pnpm dev` builds no `/api/content/` proxy.
- [ ] Gitea repository archived.

## 7. Repository side — what changed

| File | Change |
|---|---|
| `.github/workflows/deploy.yml` | new; port of the Gitea workflow, behaviour identical, `permissions: contents: read` added to all three jobs; the deploy target is `${{ vars.STACK_DIR }}/dist/` behind a "Check stack directory" step (D15) |
| `.github/workflows/deploy-infra.yml` | new; port, with the test-before-touch placeholders under the `CONTENT_API_*` names; five stack paths read `${{ vars.STACK_DIR }}`, four docker names read `${{ vars.CONTAINER_NAME }}`, all behind one "Check stack variables" step that also greps `compose.yaml` (D15) |
| `nginx.conf` | `${CONTENT_API_BASE}`, `Bearer ${CONTENT_API_TOKEN}`, comments state the envsubst-before-parse fact (D4a) |
| `compose.yaml` | `NGINX_ENVSUBST_FILTER: CONTENT_API_TOKEN\|CONTENT_API_BASE` |
| `vite.config.ts` | reads `CONTENT_API_BASE` / `CONTENT_API_TOKEN`, sends `Bearer` — the same header the production proxy sends |
| `.env.example` | the two new names + the base-URL shape |
| `src/i18n/draft.ts` | `isConflict(status, message)` accepts 409 alongside 422+"does not match" and 412; comments describe the GitHub contract |
| `scripts/smoke-draft.ts` | check 14: a stubbed proxy answers 409 with GitHub's body → the document reports `conflict` with `http: 409`, the base is refreshed from the branch, the draft survives, the sequence continues to the next document, and `rebase()` still has a field to resolve |
| `src/data/site.ts` | doc comment: repository variables, not Gitea Actions variables |
| `AGENTS.md`, `README.md` | CI host, env names, GitHub variables/secrets setup |
| `specs/v4/spec-v4-deploy-infra.md`, `specs/v4/spec-v4-live-edit.md` | supersession notes pointing here; the v2 and v5 specs are completion records and are left as written |
| `.gitea/workflows/*` | kept until the first green GitHub run (D9). `deploy-infra.yml`'s test step now carries the `CONTENT_API_*` names, because the template it validates is the one this repository ships; its stack path stays a literal — no `STACK_DIR` is created on Gitea for files that are scheduled for deletion |

## 8. Accepted risks

- **Public repository.** Every content document and the whole commit history are public. The Basic-auth proxy still gates *writes*.
- **No branch protection on `master`.** The safety net stays what it always was: content validation in the `build` job, so a malformed commit fails the pipeline and the last good deploy stays live.
- **No secondary-rate-limit retry** (D5a). A 403/429 from GitHub would surface as a failed document and a resumable partial save — visible, not silent.
- **Firewall dependence.** The deploy and infra jobs reach the VPS over SSH from GitHub's runner pool; a host-side firewall tightening its source allow-list breaks deploys, not builds.
- **Two pipelines coexist until D9 is closed.** Until `.gitea/workflows/` is deleted, a push to `master` on both hosts deploys twice.
