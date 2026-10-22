import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { CONTENT, UI } from '../src/i18n/index.js';
import type { ResolvedExperienceEntry, ResolvedProject, ResolvedSkillGroup } from '../src/i18n/index.js';
import { resumeQr } from '../src/data/resume.js';
import { siteUrl } from '../src/data/site.js';
import type { Language } from '../src/types/index.js';

const ROOT = resolve(import.meta.dirname, '..');

// --- CLI args ---
const args = process.argv.slice(2);
const langArg = (args.find(a => a.startsWith('--lang=')) || '').replace('--lang=', '');
const previewMode = args.includes('--preview');

let langs: Language[];
if (langArg === 'all') {
  if (previewMode) {
    console.error('❌ --lang=all cannot be combined with --preview (preview renders one language)');
    process.exit(1);
  }
  langs = ['en', 'vi'];
} else {
  langs = [langArg === 'vi' ? 'vi' : 'en'];
}

// --- Validate required files ---
const requiredFiles = [
  'public/profile-photo.webp',
  'public/fonts/SourceSans3-Regular.woff2',
  'public/fonts/SourceSans3-Medium.woff2',
  'public/fonts/SourceSans3-Semibold.woff2',
  'public/fonts/SourceSans3-Bold.woff2',
  'public/resume-template.html',
];

for (const file of requiredFiles) {
  if (!existsSync(join(ROOT, file))) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
}

// --- Read template ---
const template = readFileSync(join(ROOT, 'public/resume-template.html'), 'utf-8');

// --- Read and base64-encode assets ---
const photoBase64 = readFileSync(join(ROOT, 'public/profile-photo.webp')).toString('base64');

const fonts: Record<string, string> = {};
for (const [name, weight] of [
  ['REGULAR', 'SourceSans3-Regular.woff2'],
  ['MEDIUM', 'SourceSans3-Medium.woff2'],
  ['SEMIBOLD', 'SourceSans3-Semibold.woff2',],
  ['BOLD', 'SourceSans3-Bold.woff2'],
] as const) {
  fonts[name] = readFileSync(join(ROOT, 'public/fonts', weight)).toString('base64');
}

// --- Generate font-face CSS ---
const fontFaces = Object.entries(fonts).map(([key, b64]) => {
  const weightMap: Record<string, number> = { REGULAR: 400, MEDIUM: 500, SEMIBOLD: 600, BOLD: 700 };
  return `@font-face {
  font-family: 'Source Sans 3';
  font-style: normal;
  font-weight: ${weightMap[key]};
  font-display: swap;
  src: url('data:font/woff2;base64,${b64}') format('woff2');
}`;
}).join('\n');

// --- Company logos: load every logo referenced by experience entries ---
const logoIds = [...new Set(CONTENT.en.experiences.map(exp => exp.logo).filter((id): id is string => id !== undefined))];
const logos: Record<string, string> = {};
for (const id of logoIds) {
  const logoFile = join(ROOT, 'public/resume-logos', `${id}.svg`);
  if (!existsSync(logoFile)) {
    console.error(`❌ Missing logo asset: public/resume-logos/${id}.svg`);
    process.exit(1);
  }
  logos[id] = readFileSync(logoFile).toString('base64');
}

// --- QR codes: owner-exported images from the Telegram/Zalo apps ---
// These are private, owner-supplied assets (not committed). A missing file is
// reported loudly but does not block the build — the resume still ships without it.
const qrMime: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
const qrAssets: { label: string; dataUri: string }[] = [];
for (const q of resumeQr) {
  const file = join(ROOT, 'public/resume-qr', q.file);
  if (!existsSync(file)) {
    console.warn(`⚠️  QR asset missing: public/resume-qr/${q.file} — ${q.label} QR skipped`);
    continue;
  }
  const ext = q.file.split('.').pop() ?? '';
  const mime = qrMime[ext] ?? 'image/png';
  qrAssets.push({ label: q.label, dataUri: `data:${mime};base64,${readFileSync(file).toString('base64')}` });
}

// --- Version stamp date ---
const updatedDate = new Date().toISOString().slice(0, 10);

// (Removed: the inline `labels` map and `resolveField` — labels now live in
// the UI dictionaries and text arrives pre-resolved through CONTENT.)


// --- Escape data strings before injection ---
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// QR block: owner-exported Telegram/Zalo QR images, right side of the header
function renderQr(lang: Language): string {
  return qrAssets
    .map(q => `
      <div class="qr-item">
        <img class="qr-img" src="${q.dataUri}" alt="${escapeHtml(`${q.label} ${UI[lang].resume.QR_ALT}`)}" />
        <span class="qr-label">${escapeHtml(q.label)}</span>
      </div>`)
    .join('');
}

// --- Render HTML helpers ---
function renderExperience(exps: ResolvedExperienceEntry[]): string {
  return exps
    // open-to-work (variant 'current') is excluded from the resume PDF entirely
    .filter(exp => exp.variant !== 'current')
    .map(exp => {
      const variantClass = exp.variant ? ` ${exp.variant}` : '';
      const companyLine = [exp.company, exp.location].filter(Boolean).join(' · ');
      const responsibilities = exp.responsibilities;
      return `
    <div class="exp-entry avoid-break${variantClass}">
      <div class="exp-header">
        <span class="exp-title">${escapeHtml(exp.title)}</span>
        <span class="exp-duration">${escapeHtml(exp.duration)}</span>
      </div>
      <div class="exp-company">${exp.logo ? `<img class="exp-logo" src="data:image/svg+xml;base64,${logos[exp.logo]}" alt="" />` : ''}${escapeHtml(companyLine)}</div>
      <ul class="exp-responsibilities">
        ${responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
      </ul>
    </div>
  `;
    })
    .join('');
}

function renderTldr(lang: Language): string {
  return `
    <div class="timeline-tldr avoid-break">
      <div class="timeline-tldr-chip">${escapeHtml(UI[lang].experience.tldr)}</div>
      <div class="timeline-tldr-text">${escapeHtml(CONTENT[lang].profile.tldr)}</div>
    </div>
  `;
}

function renderSkills(groups: ResolvedSkillGroup[]): string {
  return groups.map(group => `
    <div class="skill-group avoid-break">
      <div class="skill-group-title">${escapeHtml(group.title)}</div>
      <div class="skill-list">${group.skills.map(skill => escapeHtml(skill)).join(' · ')}</div>
    </div>
  `).join('');
}

function renderProjects(projs: ResolvedProject[]): string {
  return projs.map(project => `
    <div class="project avoid-break">
      <div class="project-title">${escapeHtml(project.title)}</div>
      <div class="project-role">${escapeHtml(project.role)}</div>
      <div class="project-summary">${escapeHtml(project.summary)}</div>
      <div class="project-tech">
        ${project.technologies.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// --- Assemble HTML ---
function buildHtml(lang: Language): string {
  const c = CONTENT[lang];
  const r = UI[lang].resume;
  const fills: Array<[string, string]> = [
    ['{{NAME}}', escapeHtml(c.profile.name)],
    ['{{TITLE}}', escapeHtml(c.profile.title)],
    ['{{BIO}}', escapeHtml(c.profile.bio)],
    ['{{EMAIL}}', escapeHtml(c.profile.email)],
    ['{{GITHUB_URL}}', escapeHtml(c.profile.githubUrl)],
    ['{{LINKEDIN_URL}}', escapeHtml(c.profile.linkedinUrl)],
    ['{{PHOTO_BASE64}}', photoBase64],
    ['{{FONT_FACES}}', fontFaces],
    ['{{UPDATED_DATE}}', updatedDate],
    ['{{UPDATED_LABEL}}', r.UPDATED],
    ['{{SITE_URL}}', escapeHtml(siteUrl)],
    ['{{LANG}}', lang],
    ['{{EXPERIENCE_LABEL}}', r.EXPERIENCE],
    ['{{SKILLS_LABEL}}', r.SKILLS],
    ['{{PROJECTS_LABEL}}', r.PROJECTS],
    ['{{EXPERIENCE}}', renderExperience(c.experiences)],
    ['{{TLDR}}', renderTldr(lang)],
    ['{{SKILLS}}', renderSkills(c.skillGroups)],
    ['{{PROJECTS}}', renderProjects(c.projects)],
    ['{{QR_CODES}}', renderQr(lang)],
  ];
  return fills.reduce((html, [key, value]) => html.split(key).join(value), template);
}

// --- Build per language; fail fast on unresolved placeholders ---
const pages: Record<Language, string> = { en: '', vi: '' };
for (const lang of langs) {
  const html = buildHtml(lang);
  const leftover = html.match(/\{\{[A-Z_]+\}\}/g);
  if (leftover) {
    console.error(`❌ Unresolved placeholders in resume HTML [${lang}]: ${[...new Set(leftover)].join(', ')}`);
    process.exit(1);
  }
  pages[lang] = html;
}

// --- Generate output ---
const browser = await chromium.launch({ headless: !previewMode });

if (previewMode) {
  const lang = langs[0];
  const page = await browser.newPage();
  await page.setContent(pages[lang]);
  await page.bringToFront();
  console.log(`Preview opened in browser [${lang}] — Ctrl+C to exit`);
  await Promise.withResolvers<void>().promise;
} else {
  const page = await browser.newPage();
  for (const lang of langs) {
    const langSuffix = lang === 'en' ? '' : `-${lang}`;
    const outputPath = join(ROOT, `dist/resume${langSuffix}.pdf`);
    mkdirSync(dirname(outputPath), { recursive: true });
    await page.setContent(pages[lang]);
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
    });
    console.log(`resume${langSuffix}.pdf generated at ${outputPath} [${lang}]`);
  }
  await browser.close();
}
