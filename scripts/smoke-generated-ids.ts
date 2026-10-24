// Smoke test for the content-id generator (spec-v5 §5.5): what the generated
// module must guarantee — the union is exactly the document, in document order,
// an emptied document is `never`, a malformed document is refused with its path,
// and the same documents always produce the same bytes.
// Run: pnpm tsx scripts/smoke-generated-ids.ts
import { readFileSync } from 'node:fs';
import { collectOutput, readDocuments } from './generate-content-types';

const fail = (msg: string): never => {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};

const readJson = (relative: string): unknown =>
  JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'));

// The documents read the way a reader would: checked, then used.
function idsFrom(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) fail(`${label}: expected an array of records`);
  return value.map((row, index) => {
    const id = row && typeof row === 'object' && 'id' in row ? row.id : undefined;
    if (typeof id !== 'string') fail(`${label}: record ${index} has no string id`);
    return id;
  });
}

function categoriesFrom(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) fail(`${label}: expected an array of records`);
  const categories: string[] = [];
  value.forEach((row, index) => {
    const category = row && typeof row === 'object' && 'category' in row ? row.category : undefined;
    if (typeof category !== 'string') fail(`${label}: record ${index} has no string category`);
    if (!categories.includes(category)) categories.push(category);
  });
  return categories;
}

// The unions as a reader sees them, parsed straight out of the generated text.
function unionMembers(text: string, name: string): string[] {
  const declaration = new RegExp(`export type ${name} =([^;]*);`, 'm').exec(text);
  if (!declaration) fail(`no ${name} declaration in the generated module`);
  const body = declaration[1].trim();
  if (body === 'never') return [];
  return [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((literal) => JSON.parse(`"${literal[1]}"`));
}

const throwsWithPath = (fn: () => unknown, file: string, label: string): void => {
  try {
    fn();
  } catch (error) {
    const message = (error as Error).message;
    if (!message.includes(file)) fail(`${label} did not name ${file}: ${message}`);
    return;
  }
  fail(`${label} was accepted`);
};

const generated = collectOutput(readDocuments());

// 1. The shipped documents and the shipped module agree — every union is exactly
// the ids its document carries, in document order, with nothing left over. This
// is the guarantee the hand-written unions could not keep (a deleted skill group
// left 'logistics-technology' behind and the build failed with TS2741).
const projectsDoc = readJson('../src/data/projects.json');
const projectIds = idsFrom(projectsDoc, 'projects.json');
const categoryValues = categoriesFrom(projectsDoc, 'projects.json');
const experienceIds = idsFrom(readJson('../src/data/experience.json'), 'experience.json');
const skillGroupIds = idsFrom(readJson('../src/data/skills.json'), 'skills.json');
const profileDoc = readJson('../src/data/profile.json');
const philosophyList =
  profileDoc && typeof profileDoc === 'object' && 'philosophy' in profileDoc ? profileDoc.philosophy : undefined;
const philosophyIds = idsFrom(philosophyList, 'profile.json → philosophy');

const expected: Record<string, string[]> = {
  ProjectId: projectIds,
  ExperienceId: experienceIds,
  SkillGroupId: skillGroupIds,
  PhilosophyId: philosophyIds,
  ProjectCategory: categoryValues,
};
for (const [name, ids] of Object.entries(expected)) {
  const emitted = unionMembers(generated.output, name);
  if (JSON.stringify(emitted) !== JSON.stringify(ids))
    fail(`${name} does not match its document: ${JSON.stringify(emitted)} vs ${JSON.stringify(ids)}`);
}

// 2. The file on disk is what these very documents produce right now — a
// generated module that drifted from its sources is a build-time lie.
const onDisk = readFileSync(new URL('../src/types/content-ids.ts', import.meta.url), 'utf8');
if (onDisk !== generated.output) fail('src/types/content-ids.ts is not what the documents generate');

// 3. Determinism: the same documents, the same bytes, twice.
if (collectOutput(readDocuments()).output !== generated.output)
  fail('generation is not byte-stable for the same input');

// 4. An emptied document generates `never`, which keeps Record<never, T> valid
// against an empty text document and X[] valid against an empty array.
const emptied = collectOutput({ projects: [], experience: [], skills: [], profile: { philosophy: [] } });
for (const name of Object.keys(expected)) {
  if (!emptied.output.includes(`export type ${name} = never;`)) fail(`${name} of an empty document is not never`);
  if (unionMembers(emptied.output, name).length !== 0) fail(`${name} never still lists members`);
}

// 5. A duplicate id is refused, naming the file: a duplicate would make the
// union narrower than the document, silently.
throwsWithPath(
  () => collectOutput({ projects: [{ id: 'a', category: 'x' }, { id: 'a', category: 'y' }], experience: [], skills: [], profile: { philosophy: [] } }),
  'src/data/projects.json',
  'a duplicate id',
);

// 6. A record without a usable id or category is refused, naming the file.
throwsWithPath(
  () => collectOutput({ projects: [{ category: 'x' }], experience: [], skills: [], profile: { philosophy: [] } }),
  'src/data/projects.json',
  'a record with no id',
);
throwsWithPath(
  () => collectOutput({ projects: [{ id: 'a' }], experience: [], skills: [], profile: { philosophy: [] } }),
  'src/data/projects.json',
  'a record with no category',
);
throwsWithPath(
  () => collectOutput({ projects: [], experience: { id: 'oops' }, skills: [], profile: { philosophy: [] } }),
  'src/data/experience.json',
  'a document that is not an array',
);
throwsWithPath(
  () => collectOutput({ projects: [], experience: [], skills: [], profile: {} }),
  'src/data/profile.json',
  'a missing philosophy array',
);

// 7. Any slug is expressible: a literal is quoted so it round-trips, and the
// document order is preserved rather than sorted.
const odd = collectOutput({
  projects: [
    { id: 'b"quote', category: 'a category' },
    { id: 'a-first', category: 'a category' },
  ],
  experience: [],
  skills: [],
  profile: { philosophy: [] },
});
if (JSON.stringify(unionMembers(odd.output, 'ProjectId')) !== JSON.stringify(['b"quote', 'a-first']))
  fail(`quoted or ordered ids were mangled: ${JSON.stringify(unionMembers(odd.output, 'ProjectId'))}`);
if (JSON.stringify(unionMembers(odd.output, 'ProjectCategory')) !== JSON.stringify(['a category']))
  fail('a category was duplicated or reordered');

console.log('generated content ids: all 7 checks passed');
