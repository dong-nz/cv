import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { siteUrl } from '../src/data/site.js';
import { navPaths } from '../src/data/navigation.js';
import { projects } from '../src/data/projects.js';
import { pageManifests } from '../src/data/pages.js';
import type { ContentEntityId } from '../src/types/index.js';

const ROOT = resolve(import.meta.dirname, '..');
const distDir = join(ROOT, 'dist');

// Run after `vite build` and `pnpm generate:routes`: the sitemap is a build
// artifact, and the guards below can only compare against artifacts that have
// already been produced.
if (!existsSync(distDir)) {
  console.error(`dist/ not found — run \`pnpm build\` before \`pnpm sitemap\`.`);
  process.exit(1);
}

// The published head is generated from %SITE_URL% tokens (site-identity vite
// plugin, spec-v4-deploy-infra D10); this guard validates that the injection
// actually happened with the same value this script derives its URLs from — a
// mismatch means the build ran without a consistent SITE_URL.
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');
if (!indexHtml.includes(siteUrl)) {
  console.error(
    `Canonical origin mismatch: dist/index.html does not contain "${siteUrl}". ` +
    'The site-identity plugin injects it from SITE_URL — check the build environment.',
  );
  process.exit(1);
}

// The coupling guard (spec-v8 §9): every sitemap URL must have the real file
// the route generator wrote for it — nginx answers known routes from those
// files, so a skipped `generate:routes` step is a loud build failure here,
// never a deploy that 404s every SPA route.
const routeFiles = new Map<string, string>([[navPaths[0], 'index.html']]);
for (const project of projects) routeFiles.set(`/projects/${project.id}`, `projects/${project.id}/index.html`);
for (const manifest of pageManifests) {
  // '/projects/:id' is a route template, not a file — its concrete URLs are
  // enumerated from the project data above.
  if (manifest.route && manifest.route !== '/' && !manifest.route.includes(':'))
    routeFiles.set(manifest.route, `${manifest.route.slice(1)}/index.html`);
}
for (const [route, file] of routeFiles) {
  if (!existsSync(join(distDir, file))) {
    console.error(
      `Route file missing: ${route} → dist/${file}. Run \`pnpm generate:routes\` after \`vite build\` ` +
        '(the build script chains them) — a sitemap URL without its file deploys as a 404.',
    );
    process.exit(1);
  }
}

// --- lastmod from the documents that back each URL (spec-v8 §2.1) ----------
// The audit's point (§5): lastmod means "this page's content changed", not
// "the build ran". Each URL's date is the newest commit touching the files
// that page renders — the manifest itself, the structure + text documents of
// every entity it claims, and the locale files of every UI group it owns.
const ENTITY_FILES: Record<ContentEntityId, string[]> = {
  profile: [
    'src/data/profile.json',
    'src/i18n/locales/vi/content/profile.json',
    'src/i18n/locales/en/content/profile.json',
  ],
  skillGroups: [
    'src/data/skills.json',
    'src/i18n/locales/vi/content/skills.json',
    'src/i18n/locales/en/content/skills.json',
  ],
  experiences: [
    'src/data/experience.json',
    'src/i18n/locales/vi/content/experience.json',
    'src/i18n/locales/en/content/experience.json',
  ],
  projects: [
    'src/data/projects.json',
    'src/i18n/locales/vi/content/projects.json',
    'src/i18n/locales/en/content/projects.json',
  ],
};

// UI group key → locale file stem (the names i18n/index.ts imports).
const UI_GROUP_FILES: Record<string, string> = {
  nav: 'navigation',
  social: 'social',
  footer: 'footer',
  hero: 'hero',
  about: 'about',
  expertise: 'expertise',
  experience: 'experience',
  projects: 'projects',
  contact: 'contact',
  projectDetail: 'project-detail',
  philosophy: 'philosophy',
  howItWorks: 'how-it-works',
  common: 'common',
  resume: 'resume',
  edit: 'edit',
  meta: 'meta',
};

const PROJECT_DETAIL_FILES = [
  'src/data/projects.json',
  'src/i18n/locales/vi/content/projects.json',
  'src/i18n/locales/en/content/projects.json',
  'src/i18n/locales/vi/ui/projects.json',
  'src/i18n/locales/en/ui/projects.json',
];

const buildDate = new Date().toISOString().slice(0, 10);

function gitDate(files: string[]): string {
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--date=short', '--format=%ad', '--', ...files],
      { cwd: ROOT, encoding: 'utf-8' },
    ).trim();
    return out || buildDate;
  } catch {
    // No git available (or this tree is not a checkout) — fall back to the
    // build date rather than failing the pipeline over a metadata nicety.
    return buildDate;
  }
}

function manifestFiles(manifestId: string): string[] | null {
  const manifest = pageManifests.find((m) => m.id === manifestId && m.route);
  if (!manifest) return null;
  const files = [`src/data/pages/${manifest.id}.json`];
  for (const claim of manifest.content) files.push(...ENTITY_FILES[claim.entity]);
  for (const group of manifest.ui) {
    const stem = UI_GROUP_FILES[group];
    if (stem) files.push(`src/i18n/locales/vi/ui/${stem}.json`, `src/i18n/locales/en/ui/${stem}.json`);
  }
  return files;
}

// Route id = the bar path with the leading slash dropped ('/' → 'home',
// '/how-it-works' → 'how-it-works') — the same ids the manifests carry.
function lastmodForRoute(route: string): string {
  const id = route === '/' ? 'home' : route.slice(1);
  const files = manifestFiles(id);
  return files ? gitDate(files) : buildDate;
}

// navPaths is the seven bar routes; the eighth URL group (/projects/:id) is
// enumerated from the project data, so a new project lands in the sitemap
// automatically.
const locations = [
  ...navPaths.map((path) => ({
    loc: `${siteUrl}${path}`,
    lastmod: lastmodForRoute(path),
  })),
  ...projects.map((project) => ({
    loc: `${siteUrl}/projects/${project.id}`,
    lastmod: gitDate(PROJECT_DETAIL_FILES),
  })),
];

const entries = locations
  .map((url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n  </url>`)
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

writeFileSync(join(distDir, 'sitemap.xml'), xml);
console.log(`sitemap.xml generated at ${join(distDir, 'sitemap.xml')} (${locations.length} urls)`);

// robots.txt is generated here too (spec-v4-deploy-infra D10): the Sitemap:
// pointer must derive from the same siteUrl as the sitemap itself, so there is
// no committed robots.txt that could drift from it.
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
writeFileSync(join(distDir, 'robots.txt'), robots);
console.log(`robots.txt generated at ${join(distDir, 'robots.txt')}`);
