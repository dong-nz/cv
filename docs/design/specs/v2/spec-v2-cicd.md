# Specification — v2 CI/CD Pipeline

> **Document:** `spec-v2-cicd.md`
> **Version:** 0.1.0
> **Parent:** `spec-v2.md`
> **Priority:** P5
> **Estimate:** ~1 hour

---

## Requirement

GitHub Actions pipeline cho automated build, lint, test. Vercel cho deployment.

---

## GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
```

## Vercel Integration

- Connect GitHub repo
- Auto deploy on `dev` → preview
- Auto deploy on `main` → production
- Environment variables: `SITE_URL`, `PLAUSIBLE_DOMAIN` (optional)

---

## Acceptance

- [ ] CI pass trên push vào dev
- [ ] Lint pass
- [ ] Build pass
- [ ] Tests pass
- [ ] Preview deploy trên Vercel
- [ ] Production deploy khi merge vào main
