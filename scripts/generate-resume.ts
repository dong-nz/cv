import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { profile } from '../src/data/profile.js';
import { experiences } from '../src/data/experience.js';
import { skillGroups } from '../src/data/skills.js';
import { projects } from '../src/data/projects.js';
const ROOT = resolve(import.meta.dirname, '..');

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

// --- Render HTML helpers ---
function renderExperience(exps: typeof experiences): string {
  return exps.map(exp => `
    <div class="exp-entry avoid-break">
      <div class="exp-header">
        <span class="exp-title">${exp.title}</span>
        <span class="exp-duration">${exp.duration}</span>
      </div>
      <div class="exp-company">${exp.company}</div>
      ${exp.location ? `<div class="exp-location">${exp.location}</div>` : ''}
      <ul class="exp-responsibilities">
        ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
      </ul>
      ${exp.achievements?.map(ach => `
        <div class="achievement avoid-break">
          <div class="achievement-title">${ach.title}</div>
          <div class="achievement-context">${ach.context}</div>
          ${ach.technicalWork?.length ? `
            <ul class="achievement-technical">
              ${ach.technicalWork.map(t => `<li>${t}</li>`).join('')}
            </ul>
          ` : ''}
          <div class="achievement-tech">
            ${ach.technologies.map(t => `<span>${t}</span>`).join('')}
          </div>
          ${ach.impact ? `<div class="achievement-impact">${ach.impact}</div>` : ''}
          ${ach.metrics?.length ? `<div class="achievement-metrics">${ach.metrics.join(', ')}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderSkills(groups: typeof skillGroups): string {
  return groups.map(group => `
    <div class="avoid-break">
      <div class="skill-group-title">${group.title}</div>
      <div class="skill-list">${group.skills.join(' · ')}</div>
    </div>
  `).join('');
}

function renderProjects(projs: typeof projects): string {
  return projs.map(project => `
    <div class="project avoid-break">
      <div class="project-title">${project.title}</div>
      <div class="project-role">${project.role}</div>
      <div class="project-summary">${project.summary}</div>
      <div class="project-tech">
        ${project.technologies.map(t => `<span>${t}</span>`).join('')}
      </div>
      ${project.metrics?.length ? `<div class="project-metrics">${project.metrics.join(', ')}</div>` : ''}
    </div>
  `).join('');
}

// --- Assemble HTML ---
const html = template
  .replace('{{NAME}}', profile.name)
  .replace('{{TITLE}}', profile.title)
  .replace('{{EMAIL}}', profile.email)
  .replace('{{GITHUB}}', profile.githubUrl.replace('https://', 'github.com/'))
  .replace('{{LINKEDIN}}', profile.linkedinUrl.replace('https://', 'linkedin.com/in/'))
  .replace('{{PHOTO_BASE64}}', photoBase64)
  .replace('{{FONT_FACES}}', fontFaces)
  .replace('{{EXPERIENCE}}', renderExperience(experiences))
  .replace('{{SKILLS}}', renderSkills(skillGroups))
  .replace('{{PROJECTS}}', renderProjects(projects));

// --- Generate PDF ---
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);  // No waitUntil needed — all resources inline

const outputPath = join(ROOT, 'dist/resume.pdf');
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  // margin inherited from @page CSS
});

await browser.close();
console.log(`resume.pdf generated at ${outputPath}`);
