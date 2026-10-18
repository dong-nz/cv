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

// index.html carries the canonical origin as static markup; site.ts carries it as data.
// A mismatch means one of the two was edited without the other.
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');
if (!indexHtml.includes(siteUrl)) {
  console.error(
    `Canonical origin mismatch: index.html does not contain "${siteUrl}". ` +
    `Update the canonical/og:url/theme-color block in index.html or src/data/site.ts.`
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
