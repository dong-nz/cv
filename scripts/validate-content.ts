// CLI over the shared validator (spec-v4 §3.6, spec-v4-data-organization §5.1):
// the CI build gate and, from Phase 3 on, the save gate. A malformed content
// or manifest document fails here with exact file paths, so the last good
// deploy stays live.
import { experiences } from '../src/data/experience';
import { profile } from '../src/data/profile';
import { projects } from '../src/data/projects';
import { skillGroups } from '../src/data/skills';
import experienceEnJson from '../src/i18n/locales/en/content/experience.json';
import experienceViJson from '../src/i18n/locales/vi/content/experience.json';
import profileEnJson from '../src/i18n/locales/en/content/profile.json';
import profileViJson from '../src/i18n/locales/vi/content/profile.json';
import projectsEnJson from '../src/i18n/locales/en/content/projects.json';
import projectsViJson from '../src/i18n/locales/vi/content/projects.json';
import skillsEnJson from '../src/i18n/locales/en/content/skills.json';
import skillsViJson from '../src/i18n/locales/vi/content/skills.json';
import { UI } from '../src/i18n';
import type { ContentEn, ContentVi } from '../src/i18n/dict-types';
import { collectContentIssues, collectManifestIssues } from '../src/i18n/validate';

const contentVi: ContentVi = {
  profile: profileViJson,
  skills: skillsViJson,
  experience: experienceViJson,
  projects: projectsViJson,
};
const contentEn: ContentEn = {
  profile: profileEnJson,
  skills: skillsEnJson,
  experience: experienceEnJson,
  projects: projectsEnJson,
};

const structures = { profile, skills: skillGroups, experience: experiences, projects };

const issues = [
  ...collectContentIssues(structures, contentVi, contentEn),
  ...collectManifestIssues(structures, contentVi, contentEn, Object.keys(UI.vi)),
];

if (issues.length > 0) {
  console.error(`content validation failed (${issues.length} issue(s)):`);
  for (const issue of issues) {
    console.error(`  ${issue.path}: ${issue.message}`);
  }
  process.exit(1);
}
console.log('content documents valid');
