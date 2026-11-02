// Route-page generator (spec-v8 §2): build-time per-route HTML. Runs after
// `vite build`, before the sitemap step: reads dist/index.html as the head
// template and writes a real file per route so nginx can answer known routes
// with 200 and unknown ones with a genuine 404 (spec-v8 §2.1).
//
// What each generated page carries:
// - a head specific to the route: title, description, canonical, og:url,
//   og:title/og:description and the twitter pair. Static pages read the ui
//   `meta` group (the six static page manifests claim it); project detail
//   pages derive the same fields from their content records. The homepage
//   keeps its existing head — it is already self-canonical and unique — and
//   only gains the noscript body.
// - a <noscript> body generated from the page manifest claims (spec-v8 D2b):
//   the page heading, the nav links, and every text leaf the manifest claims
//   for the route — the same claim-matching the validator's orphan rule and
//   EditBar use, never a second description of the page in code. Project
//   detail pages render their fixed record shape (title, summary, metrics,
//   role, technologies, sections — diagrams as <pre>) because their layout is
//   a structure fact, not a claim.
// - dist/404.html: the static error page nginx serves with a real 404
//   (ui/common notFound keys, EN + VI block), linked to the build's hashed
//   CSS so it carries the site's theme variables.
//
// This is not prerender: the #root stays empty for JavaScript users — the
// SPA boots from any shell exactly as before. No hydration, no SSR.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { siteName, siteUrl } from '../src/data/site.js';
import { manifestClaimsPath, pageManifests } from '../src/data/pages.js';
import { navPaths } from '../src/data/navigation.js';
import { projects } from '../src/data/projects.js';
import { CONTENT, UI } from '../src/i18n/index.js';
import profileViJson from '../src/i18n/locales/vi/content/profile.json';
import skillsViJson from '../src/i18n/locales/vi/content/skills.json';
import experienceViJson from '../src/i18n/locales/vi/content/experience.json';
import projectsViJson from '../src/i18n/locales/vi/content/projects.json';
import profileEnJson from '../src/i18n/locales/en/content/profile.json';
import skillsEnJson from '../src/i18n/locales/en/content/skills.json';
import experienceEnJson from '../src/i18n/locales/en/content/experience.json';
import projectsEnJson from '../src/i18n/locales/en/content/projects.json';
import type { ContentEntityId } from '../src/types/index.js';

const ROOT = resolve(import.meta.dirname, '..');
const distDir = join(ROOT, 'dist');

// Same guard as generate-sitemap.ts: the template head must carry the same
// SITE_URL this script derives its canonicals from.
const template = (() => {
  const file = join(distDir, 'index.html');
  if (!existsSync(file)) {
    console.error('dist/index.html not found — run `vite build` before `pnpm generate:routes`.');
    process.exit(1);
  }
  const html = readFileSync(file, 'utf-8');
  if (!html.includes(siteUrl)) {
    console.error(
      `Canonical origin mismatch: dist/index.html does not contain "${siteUrl}". ` +
        'The site-identity plugin injects it from SITE_URL — check the build environment.',
    );
    process.exit(1);
  }
  return html;
})();

// --- CSP coupling guard (spec-v8 §3) ------------------------------------------
// nginx.conf's CSP script-src lists the SHA-256 of every inline script the
// built page carries. Editing the theme-init script — or vite adding one —
// would otherwise show up as a silently refused script on the live site;
// here it fails the build and prints the hash to paste into nginx.conf.
const nginxConf = readFileSync(join(ROOT, 'nginx.conf'), 'utf-8');
for (const inline of template.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  const hash = `sha256-${createHash('sha256').update(inline[1], 'utf-8').digest('base64')}`;
  if (!nginxConf.includes(hash)) {
    console.error(
      `CSP script-src hash mismatch: the built page carries an inline script whose hash is ${hash}, ` +
        'not listed in nginx.conf. Update the CSP header (see its comment) or revert the script.',
    );
    process.exit(1);
  }
}

// --- text documents, walked for the noscript bodies ---------------------------
// vi is complete by validator rule 1; en is checked leaf-by-leaf, mirroring
// i18n/index.ts deepMerge: missing en fields fall back to vi, arrays are
// atomic, never merged item by item.
const TEXT_DOCS: Record<
  'profile' | 'skills' | 'experience' | 'projects',
  { vi: unknown; en: unknown }
> = {
  profile: { vi: profileViJson, en: profileEnJson },
  skills: { vi: skillsViJson, en: skillsEnJson },
  experience: { vi: experienceViJson, en: experienceEnJson },
  projects: { vi: projectsViJson, en: projectsEnJson },
};

const ENTITY_TO_NS: Record<ContentEntityId, keyof typeof TEXT_DOCS> = {
  profile: 'profile',
  skillGroups: 'skills',
  experiences: 'experience',
  projects: 'projects',
};

type Leaf = { path: string; value: string | string[] };

function resolvedLeaves(vi: unknown, en: unknown, prefix: string): Leaf[] {
  if (typeof vi === 'string') {
    return [{ path: prefix, value: typeof en === 'string' ? en : vi }];
  }
  if (Array.isArray(vi)) {
    if (vi.every((item) => typeof item === 'string')) {
      const atomic = Array.isArray(en) && en.every((item) => typeof item === 'string');
      return [{ path: prefix, value: (atomic ? en : vi) as string[] }];
    }
    return vi.flatMap((item, i) =>
      resolvedLeaves(item, Array.isArray(en) ? en[i] : undefined, `${prefix}[${i}]`),
    );
  }
  if (vi && typeof vi === 'object') {
    return Object.entries(vi).flatMap(([key, value]) =>
      resolvedLeaves(
        value,
        en && typeof en === 'object' && !Array.isArray(en)
          ? (en as Record<string, unknown>)[key]
          : undefined,
        prefix ? `${prefix}.${key}` : key,
      ),
    );
  }
  return [];
}

// The claimed text of one manifest: document leaves filtered through the same
// claim matcher the orphan-field rule uses. Structure fields (ids, handles,
// technologies, categories) are not text documents and never appear.
function claimedText(manifestId: string, restrictToId?: string): Leaf[] {
  const manifest = pageManifests.find((m) => m.id === manifestId);
  if (!manifest) throw new Error(`no manifest for ${manifestId}`);
  const out: Leaf[] = [];
  for (const claim of manifest.content) {
    const ns = ENTITY_TO_NS[claim.entity];
    if (!ns) continue;
    const docs = TEXT_DOCS[ns];
    for (const leaf of resolvedLeaves(docs.vi, docs.en, '')) {
      if (restrictToId && !leaf.path.startsWith(`${restrictToId}.`)) continue;
      if (manifestClaimsPath(manifest, claim.entity, leaf.path)) out.push(leaf);
    }
  }
  return out;
}

// --- html helpers -------------------------------------------------------------
const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function leafHtml(leaf: Leaf): string {
  if (Array.isArray(leaf.value)) {
    const items = leaf.value.filter((item) => item.trim() !== '');
    if (items.length === 0) return '';
    return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
  }
  if (leaf.value.trim() === '') return '';
  return `<p>${esc(leaf.value)}</p>`;
}

// Nav links are the same paths the bar renders, labelled from the nav group
// (path '/' maps to the 'home' label key).
function navHtml(): string {
  const labels = UI.en.nav as Record<string, string>;
  const links = navPaths.map((path) => {
    const key = path === '/' ? 'home' : path.slice(1);
    return `<a href="${path}">${esc(labels[key] ?? path)}</a>`;
  });
  return `<nav>${links.join('')}</nav>`;
}

// --- head rewriting ------------------------------------------------------------
// The built head keeps index.html's formatting; each replacement targets one
// tag by its identifying attribute and rewrites the whole tag.
function replaceTag(html: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(html)) throw new Error(`head template missing: ${pattern}`);
  return html.replace(pattern, replacement);
}

function headFor(html: string, meta: { title: string; description: string; url: string }): string {
  let out = html;
  // SITE_NAME itself contains an em dash ("Nguyễn Đông — Senior Software
  // Engineer"), so the page/site separator is the middot — a second em dash
  // would read as a broken title.
  const pageTitle = `${meta.title} · ${siteName}`;
  out = replaceTag(out, /<title>[\s\S]*?<\/title>/, `<title>${esc(pageTitle)}</title>`);
  out = replaceTag(
    out,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${esc(meta.description)}" />`,
  );
  out = replaceTag(
    out,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${esc(meta.url)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${esc(pageTitle)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${esc(meta.url)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${esc(pageTitle)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
  );
  return out;
}

function withNoscript(html: string, body: string): string {
  const marker = '<div id="root"></div>';
  if (!html.includes(marker)) throw new Error('head template missing #root');
  return html.replace(marker, `<noscript>${body}</noscript>${marker}`);
}

function routeDir(route: string): string {
  // '/about' → dist/about/index.html; '/projects/<id>' → dist/projects/<id>/index.html.
  return join(distDir, route.slice(1), 'index.html');
}

// --- static pages --------------------------------------------------------------
const META_IDS = ['about', 'experience', 'projects', 'contact', 'philosophy', 'how-it-works'] as const;

function staticPage(id: (typeof META_IDS)[number]): void {
  const manifest = pageManifests.find((m) => m.id === id);
  if (!manifest || !manifest.route) throw new Error(`manifest ${id} has no route`);
  const meta = (UI.en.meta as Record<string, { title: string; description: string }>)[id];
  let html = headFor(template, {
    title: meta.title,
    description: meta.description,
    url: `${siteUrl}${manifest.route}`,
  });
  const content = claimedText(id)
    .map(leafHtml)
    .join('');
  const body =
    `${navHtml()}<h1>${esc(meta.title)}</h1><p>${esc(meta.description)}</p>${content}`;
  html = withNoscript(html, body);
  const file = routeDir(manifest.route);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`  ${manifest.route} → ${file.slice(ROOT.length + 1)}`);
}

// --- homepage -------------------------------------------------------------------
// Head unchanged (already correct); only the noscript body is added, h1 = the
// person name the hero renders.
function homeNoscript(): void {
  const profile = CONTENT.en.profile;
  const content = claimedText('home')
    .filter((leaf) => leaf.path !== 'name')
    .map(leafHtml)
    .join('');
  const body =
    `${navHtml()}<h1>${esc(profile.name)}</h1><p>${esc(profile.title)}</p>${content}`;
  writeFileSync(join(distDir, 'index.html'), withNoscript(template, body));
  console.log('  / → dist/index.html (noscript body added, head untouched)');
}

// --- project detail pages --------------------------------------------------------
// Fixed record shape — the same fields the page renders, in reading order.
function projectPage(id: string): void {
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error(`no project ${id}`);
  const text = CONTENT.en.projects.find((p) => p.id === id);
  if (!text) throw new Error(`no joined project record ${id}`);
  let html = headFor(template, {
    title: text.title,
    description: text.summary,
    url: `${siteUrl}/projects/${id}`,
  });
  const sections = text.sections
    .map((section) => {
      const block =
        section.type === 'diagram' || section.type === 'code'
          ? `<pre>${esc(section.content)}</pre>`
          : `<p>${esc(section.content)}</p>`;
      return `<h2>${esc(section.title)}</h2>${block}`;
    })
    .join('');
  const body =
    `${navHtml()}<h1>${esc(text.title)}</h1><p>${esc(text.summary)}</p>` +
    (text.metrics?.length ? `<ul>${text.metrics.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : '') +
    (text.role ? `<p>${esc(text.role)}</p>` : '') +
    (project.technologies.length
      ? `<ul>${project.technologies.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
      : '') +
    sections;
  html = withNoscript(html, body);
  const file = routeDir(`/projects/${id}`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`  /projects/${id} → ${file.slice(ROOT.length + 1)}`);
}

// --- 404 page --------------------------------------------------------------------
// Served by nginx with a real 404 (spec-v8 §2.1). No canonical on purpose —
// the audit's point: an error page must not claim the homepage's URL. EN and
// VI text from the common group; the theme comes from the linked hashed CSS
// (its :root block + the prefers-color-scheme bridge work without JS).
function notFoundPage(): void {
  const en = UI.en.common as Record<string, string>;
  const vi = UI.vi.common as Record<string, string>;
  const styleMatch = template.match(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"/);
  const cssLink = styleMatch
    ? `<link rel="stylesheet" href="${styleMatch[1]}" />`
    : '';
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(en.notFoundTitle)} — ${esc(siteName)}</title>
    <meta name="robots" content="noindex" />
    ${cssLink}
    <style>
      .not-found { max-width: 680px; margin: 96px auto; padding: 0 24px; }
      .not-found p { font-size: 18px; line-height: 1.65; color: var(--text-secondary); }
      .not-found a { color: var(--accent); }
      .not-found .vi { margin-top: 32px; }
    </style>
  </head>
  <body>
    <main class="not-found">
      <h1>${esc(en.notFoundTitle)}</h1>
      <p>${esc(en.notFoundBody)}</p>
      <p><a href="/">${esc(en.notFoundHome)}</a> · <a href="/projects">${esc(en.notFoundProjects)}</a></p>
      <div class="vi" lang="vi">
        <h2>${esc(vi.notFoundTitle)}</h2>
        <p>${esc(vi.notFoundBody)}</p>
        <p><a href="/">${esc(vi.notFoundHome)}</a> · <a href="/projects">${esc(vi.notFoundProjects)}</a></p>
      </div>
    </main>
  </body>
</html>
`;
  writeFileSync(join(distDir, '404.html'), html);
  console.log('  404 → dist/404.html');
}

// --- run --------------------------------------------------------------------------
console.log('route pages (spec-v8 §2):');
homeNoscript();
for (const id of META_IDS) staticPage(id);
for (const project of projects) projectPage(project.id);
notFoundPage();
console.log('done.');
