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

// --- Validate required files ---
const requiredFiles = [
  'public/profile-photo.webp',
  'public/fonts/Inter-Regular.woff2',
  'public/fonts/Inter-Medium.woff2',
  'public/fonts/Inter-SemiBold.woff2',
  'public/fonts/Inter-Bold.woff2',
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
  ['REGULAR', 'Inter-Regular.woff2'],
  ['MEDIUM', 'Inter-Medium.woff2'],
  ['SEMIBOLD', 'Inter-SemiBold.woff2'],
  ['BOLD', 'Inter-Bold.woff2'],
] as const) {
  fonts[name] = readFileSync(join(ROOT, 'public/fonts', weight)).toString('base64');
}

// --- Generate font-face CSS ---
const fontFaces = Object.entries(fonts).map(([key, b64]) => {
  const weightMap: Record<string, number> = { REGULAR: 400, MEDIUM: 500, SEMIBOLD: 600, BOLD: 700 };
  return `@font-face {
  font-family: 'Inter';
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
  },
  vi: {
    EXPERIENCE: 'Kinh nghiệm',
    SKILLS: 'Kỹ năng',
    PROJECTS: 'Dự án',
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
      ${exp.achievements?.map(ach => `
        <div class="achievement avoid-break">
          <div class="achievement-title">${resolveField(ach.titleEn, ach.title)}</div>
          <div class="achievement-context">${resolveField(ach.contextEn, ach.context)}</div>
          ${ach.technicalWork?.length ? `
            <ul class="achievement-technical">
              ${ach.technicalWork.map(t => `<li>${t}</li>`).join('')}
            </ul>
          ` : ''}
          <div class="achievement-tech">
            ${ach.technologies.map(t => `<span>${t}</span>`).join('')}
          </div>
          ${ach.impact ? `<div class="achievement-impact">${resolveField(ach.impactEn, ach.impact)}</div>` : ''}
          ${ach.metrics?.length ? `<div class="achievement-metrics">${ach.metrics.join(', ')}</div>` : ''}
        </div>
      `).join('')}
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
  .replace('{{TAGLINE}}', resolveField(profile.taglineEn, profile.tagline))
  .replace('{{BIO}}', resolveField(profile.bioEn, profile.bio))
  .replace('{{EMAIL}}', profile.email)
  .replace('{{GITHUB}}', profile.githubUrl)
  .replace('{{LINKEDIN}}', profile.linkedinUrl)
  .replace('{{PHOTO_BASE64}}', photoBase64)
  .replace('{{FONT_FACES}}', fontFaces)
  .replace('{{UPDATED_DATE}}', updatedDate)
  .replace('{{LANG}}', lang)
  .replace('{{EXPERIENCE_LABEL}}', labels[lang].EXPERIENCE)
  .replace('{{SKILLS_LABEL}}', labels[lang].SKILLS)
  .replace('{{PROJECTS_LABEL}}', labels[lang].PROJECTS)
  .replace('{{EXPERIENCE}}', renderExperience(experiences))
  .replace('{{SKILLS}}', renderSkills(skillGroups))
  .replace('{{PROJECTS}}', renderProjects(projects));

// --- Generate PDF ---
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);  // No waitUntil needed — all resources inline

const langSuffix = lang === 'en' ? '' : `-${lang}`;
const outputPath = join(ROOT, `dist/resume${langSuffix}.pdf`);
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  // margin inherited from @page CSS
  // metadata for PDF identification
  title: `Resume - ${profile.name} (${lang === 'en' ? 'English' : 'Vietnamese'})`,
  author: profile.name,
});

await browser.close();
console.log(`resume${langSuffix}.pdf generated at ${outputPath} [${lang}]`);
