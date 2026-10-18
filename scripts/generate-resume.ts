import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { profile } from '../src/data/profile.js';
import { experiences } from '../src/data/experience.js';
import { skillGroups } from '../src/data/skills.js';
import { projects } from '../src/data/projects.js';
import type { Language } from '../src/types/index.js';

const ROOT = resolve(import.meta.dirname, '..');

// --- CLI args ---
const args = process.argv.slice(2);
const langArg = (args.find(a => a.startsWith('--lang=')) || '').replace('--lang=', '') as Language;
const lang: Language = (langArg === 'en' || langArg === 'vi') ? langArg : 'en';
const previewMode = args.includes('--preview');

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
  ['SEMIBOLD', 'SourceSans3-Semibold.woff2'],
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

// --- Version stamp date ---
const updatedDate = new Date().toISOString().slice(0, 10);

// --- Language-specific label map ---
const labels: Record<Language, Record<string, string>> = {
  en: {
    EXPERIENCE: 'Experience',
    SKILLS: 'Skills',
    PROJECTS: 'Projects',
    ABOUT_ME: 'About me',
  },
  vi: {
    EXPERIENCE: 'Kinh nghiệm',
    SKILLS: 'Kỹ năng',
    PROJECTS: 'Dự án',
    ABOUT_ME: 'Về tôi',
  },
};

// --- Resolve bilingual field ---
function resolveField<T>(en?: T, vi?: T): T {
  return lang === 'en' && en !== undefined ? en : (vi !== undefined ? vi : en as T);
}

// --- Render HTML helpers ---
function renderExperience(exps: typeof experiences): string {
  return exps.map(exp => `
    <div class="exp-entry avoid-break">
      <div class="exp-header">
        <span class="exp-title">${resolveField(exp.titleEn, exp.title)}</span>
        <span class="exp-duration">${exp.duration}</span>
      </div>
      <div class="exp-company">${exp.company}</div>
      ${exp.location ? `<div class="exp-location">${exp.location}</div>` : ''}
      <ul class="exp-responsibilities">
        ${resolveField(exp.responsibilitiesEn, exp.responsibilities).map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function renderSkills(groups: typeof skillGroups): string {
  return groups.map(group => `
    <div class="avoid-break">
      <div class="skill-group-title">${resolveField(group.titleEn, group.title)}</div>
      <div class="skill-list">${group.skills.join(' · ')}</div>
    </div>
  `).join('');
}

function renderProjects(projs: typeof projects): string {
  return projs.map(project => `
    <div class="project avoid-break">
      <div class="project-title">${resolveField(project.titleEn, project.title)}</div>
      <div class="project-role">${project.role}</div>
      <div class="project-summary">${resolveField(project.summaryEn, project.summary)}</div>
      <div class="project-tech">
        ${project.technologies.map(t => `<span>${t}</span>`).join('')}
      </div>
      ${project.metrics?.length ? `<div class="project-metrics">${project.metrics.join(', ')}</div>` : ''}
    </div>
  `).join('');
}

// --- Assemble HTML ---
const html = template
  .replace('{{NAME}}', resolveField(profile.nameEn, profile.name))
  .replace('{{TITLE}}', resolveField(profile.titleEn, profile.title))
  .replace('{{BIO}}', resolveField(profile.bioEn, profile.bio))
  .replace('{{EMAIL}}', profile.email)
  .replace('{{GITHUB}}', profile.githubUrl)
  .replace('{{LINKEDIN}}', profile.linkedinUrl)
  .replace('{{PHOTO_BASE64}}', photoBase64)
  .replace('{{FONT_FACES}}', fontFaces)
  .replace('{{UPDATED_DATE}}', updatedDate)
  .replace('{{LANG}}', lang)
  .replace('{{ABOUT_ME_LABEL}}', labels[lang].ABOUT_ME)
  .replace('{{EXPERIENCE_LABEL}}', labels[lang].EXPERIENCE)
  .replace('{{SKILLS_LABEL}}', labels[lang].SKILLS)
  .replace('{{PROJECTS_LABEL}}', labels[lang].PROJECTS)
  .replace('{{EXPERIENCE}}', renderExperience(experiences))
  .replace('{{SKILLS}}', renderSkills(skillGroups))
  .replace('{{PROJECTS}}', renderProjects(projects));

// --- Generate output ---
const browser = await chromium.launch({ headless: !previewMode });

if (previewMode) {
  const page = await browser.newPage();
  await page.setContent(html);
  await page.bringToFront();
  console.log(`Preview opened in browser [${lang}] — Ctrl+C to exit`);
  await Promise.withResolvers<void>().promise;
} else {
  const langSuffix = lang === 'en' ? '' : `-${lang}`;
  const outputPath = join(ROOT, `dist/resume${langSuffix}.pdf`);
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    title: `Resume - ${profile.name} (${lang === 'en' ? 'English' : 'Vietnamese'})`,
    author: profile.name,
  });

  await browser.close();
  console.log(`resume${langSuffix}.pdf generated at ${outputPath} [${lang}]`);
}