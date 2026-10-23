import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { siteUrl } from '../src/data/site.js';
import { navPaths } from '../src/data/navigation.js';
import { projects } from '../src/data/projects.js';

const ROOT = resolve(import.meta.dirname, '..');
const distDir = join(ROOT, 'dist');

// Run after `vite build`: the sitemap is a build artifact, and the guard below can
// only compare against a head that has already been produced.
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
    `The site-identity plugin injects it from SITE_URL — check the build environment.`,
  );
  process.exit(1);
}

const lastmod = new Date().toISOString().slice(0, 10);

// navPaths is the six bar routes; the seventh route (/projects/:id) is enumerated
// from the project data, so a new project lands in the sitemap automatically.
const locations = [
  ...navPaths.map((path) => `${siteUrl}${path}`),
  ...projects.map((project) => `${siteUrl}/projects/${project.id}`),
];

const entries = locations
  .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
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
