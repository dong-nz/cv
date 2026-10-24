// Smoke test for the draft store (spec-v4 §5.1, §5.5, §5.6; registry per
// spec-v4-data-organization §6.1). Id unions are no longer the store's
// business — scripts/generate-content-types.ts derives them from these very
// documents (spec-v5), so what is checked here is the draft itself: text
// writes, record add/delete/rename, conflicts and rebase, and the validator
// rules a rejected edit is reported through.
// Run: pnpm tsx scripts/smoke-draft.ts
import { DraftStore, bundledBase } from '../src/i18n/draft';
import type { CategoryLabels } from '../src/i18n/validate';
import projectsEnUiJson from '../src/i18n/locales/en/ui/projects.json';
import projectsViUiJson from '../src/i18n/locales/vi/ui/projects.json';

const fail = (msg: string): never => {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};

// Rule 7's read-only input, exactly as the edit session supplies it.
const LABELS: CategoryLabels = {
  vi: projectsViUiJson.categories as Record<string, unknown>,
  en: projectsEnUiJson.categories as Record<string, unknown>,
};

const bases = bundledBase();
const store = new DraftStore(structuredClone(bases), LABELS);

const projects = store.dataOf('projects') as { id: string }[];
const firstProject = projects[0].id;

// 1. setValue on a text path is accepted and tracked in the entity document
// of the edited language; the diff stores the document-relative pointer.
const rejected = store.setValue('vi', `projects.${firstProject}.summary`, 'SUMMARY CHANGED');
if (rejected !== null) fail(`valid edit rejected: ${JSON.stringify(rejected)}`);
if (!store.isDirty()) fail('store not dirty after accepted edit');
const paths = store.changedPaths('projects.vi');
if (!paths.includes(`${firstProject}.summary`)) fail(`path not diffed: ${paths}`);

// 2. Empty required value is rejected and leaves the draft untouched.
const before = structuredClone(store.dataOf('profile.vi'));
const empty = store.setValue('vi', 'profile.bio', '   ');
if (empty === null) fail('empty required value accepted');
if (JSON.stringify(store.dataOf('profile.vi')) !== JSON.stringify(before))
  fail('rejected edit mutated draft');

// 3. Delete removes the structure record AND both text entries — no orphan.
const del = store.deleteRecord('project', { id: firstProject });
if (del !== null) fail(`delete rejected: ${JSON.stringify(del)}`);
const stillListed = (store.dataOf('projects') as { id: string }[]).some((p) => p.id === firstProject);
if (stillListed) fail('project still in structure after delete');
const viText = store.dataOf('projects.vi') as Record<string, unknown>;
const enText = store.dataOf('projects.en') as Record<string, unknown>;
if (viText[firstProject]) fail('vi text orphan after delete');
if (enText[firstProject]) fail('en text orphan after delete');
const issues = store.validate();
if (issues.length > 0) fail(`validate after delete: ${JSON.stringify(issues)}`);

// 4. addRecord creates a complete record in every document at once.
const add = store.addRecord('project');
if (add !== null) fail(`add rejected: ${JSON.stringify(add)}`);
const baseIds = new Set((bases.projects.data as { id: string }[]).map((p) => p.id));
const newIds = (store.dataOf('projects') as { id: string }[]).map((p) => p.id).filter((id) => !baseIds.has(id));
if (newIds.length !== 1) fail(`expected exactly one new project, got ${newIds}`);
const issuesAfterAdd = store.validate();
if (issuesAfterAdd.length > 0) fail(`validate after add: ${JSON.stringify(issuesAfterAdd)}`);

// 5. snapshot / applySaved round-trip reproduces the same changed paths.
const snapshot = store.snapshot();
const restored = new DraftStore(structuredClone(bases));
const drifted = restored.applySaved(snapshot);
if (drifted.length > 0) fail(`clean rebase reported drift: ${drifted}`);
const same =
  JSON.stringify(restored.changedDocs()) === JSON.stringify(store.changedDocs());
if (!same) fail('restored draft differs from saved snapshot');

// 6. Conflict: base changed at a path the draft also touched → rebase reports
// a conflict; take-theirs (discardDocument) clears it.
const store2 = new DraftStore(structuredClone(bases), LABELS);
store2.setValue('vi', `projects.${firstProject}.summary`, 'MINE');
const driftedBase = structuredClone(bases);
(driftedBase['projects.vi'].data as Record<string, Record<string, string>>)[firstProject].summary = 'THEIRS';
store2.resetBase('projects.vi', driftedBase['projects.vi']);
const rebaseIssues = store2.rebase('projects.vi');
if (rebaseIssues === null) fail('rebase silently took one side on a real conflict');
store2.discardDocument('projects.vi');
if (store2.changedPaths('projects.vi').includes(`${firstProject}.summary`))
  fail('take-theirs left draft residue');

// 7. Clean rebase: base changed at a DIFFERENT path → draft edit survives.
const store3 = new DraftStore(structuredClone(bases), LABELS);
store3.setValue('vi', `projects.${firstProject}.summary`, 'MINE');
const otherBase = structuredClone(bases);
const otherId = projects[1].id;
(otherBase['projects.vi'].data as Record<string, Record<string, string>>)[otherId].summary = 'THEIRS';
store3.resetBase('projects.vi', otherBase['projects.vi']);
const clean = store3.rebase('projects.vi');
if (clean !== null) fail(`clean rebase rejected: ${JSON.stringify(clean)}`);
const mergedText = store3.dataOf('projects.vi') as Record<string, Record<string, string>>;
if (mergedText[firstProject].summary !== 'MINE') fail('rebase lost the draft edit');
if (mergedText[otherId].summary !== 'THEIRS') fail('rebase lost the base edit');

// 8. A text document that does not hold an array field yet (an older target
// branch — the field still lives in the structure document) must gain a real
// array when a [0] path is committed; an object-keyed pseudo-array crashed
// TagListEditor's items.map on the re-render after the first tag edit.
const store4 = new DraftStore(structuredClone(bases), LABELS);
const baseVi = store4.dataOf('profile.vi') as Record<string, Record<string, unknown>>;
delete baseVi.currentInterests;
const tagEdit = store4.setValue('vi', 'profile.currentInterests[0]', 'NEW TAG');
if (tagEdit !== null) fail(`tag edit rejected: ${JSON.stringify(tagEdit)}`);
const arr = (store4.dataOf('profile.vi') as Record<string, Record<string, unknown>>).currentInterests;
if (!Array.isArray(arr)) fail(`setPath made ${JSON.stringify(arr)}, not an array`);
if (arr[0] !== 'NEW TAG') fail('array element not set');

// 9. A skill-group delete removes the record and its text in both languages,
// and the draft still validates.
const store5 = new DraftStore(structuredClone(bases), LABELS);
const groupIds = (store5.dataOf('skills') as { id: string }[]).map((g) => g.id);
const victim = groupIds[groupIds.length - 1];
const delGroup = store5.deleteRecord('skill-group', { id: victim });
if (delGroup !== null) fail(`skill-group delete rejected: ${JSON.stringify(delGroup)}`);
const afterDelete = store5.validate();
if (afterDelete.length > 0) fail(`validate after delete: ${JSON.stringify(afterDelete)}`);
if ((store5.dataOf('skills.vi') as Record<string, unknown>)[victim])
  fail('vi skill-group text orphan after delete');
if ((store5.dataOf('skills.en') as Record<string, unknown>)[victim])
  fail('en skill-group text orphan after delete');

// 10. A created record keeps following its title: renaming re-sluges the id in
// the structure document and both text documents at once (E3). 'Home' → 'home'
// is the case a naive substring replacement would break.
const store6 = new DraftStore(structuredClone(bases), LABELS);
const addGroup = store6.addRecord('skill-group');
if (addGroup !== null) fail(`skill-group add rejected: ${JSON.stringify(addGroup)}`);
const known = new Set(groupIds);
const created = (store6.dataOf('skills') as { id: string }[]).find((g) => !known.has(g.id));
if (!created) fail('no new skill group created');
const rename = store6.renameRecord('skill-group', { id: created.id }, 'Home');
if (rename !== null) fail(`rename rejected: ${JSON.stringify(rename)}`);
const renamed = (store6.dataOf('skills') as { id: string }[]).map((g) => g.id);
if (!renamed.includes('home')) fail('rename did not apply');
if (renamed.includes(created.id)) fail('the pre-rename id survived');
const renamedText = store6.dataOf('skills.vi') as Record<string, unknown>;
if (renamedText[created.id]) fail('text kept the pre-rename id');
if (!renamedText.home) fail('text did not follow the renamed id');
const afterRename = store6.validate();
if (afterRename.length > 0) fail(`validate after rename: ${JSON.stringify(afterRename)}`);

// 11. Rule 7 (spec-v5 D4): a category a project uses must have a label in
// both languages — the badge would render empty. The category union is
// generated from the documents, so a value written straight into
// src/data/projects.json is exactly what this catches.
const store7 = new DraftStore(structuredClone(bases), LABELS);
const rejectedCategory = store7.setStructured('projects', '[0].category', 'not-a-category');
if (rejectedCategory === null) fail('a label-less category was accepted');
const issuePaths = rejectedCategory.map((issue) => issue.path).sort();
const expectedPaths = [
  'src/i18n/locales/en/ui/projects.json: categories.not-a-category',
  'src/i18n/locales/vi/ui/projects.json: categories.not-a-category',
].sort();
if (JSON.stringify(issuePaths) !== JSON.stringify(expectedPaths))
  fail(`rule 7 reported the wrong issues: ${JSON.stringify(issuePaths)}`);
if (store7.isDirty()) fail('a rejected structure write mutated the draft');
const acceptedCategory = store7.setStructured('projects', '[0].category', 'logistics');
if (acceptedCategory !== null) fail(`labeled category rejected: ${JSON.stringify(acceptedCategory)}`);

console.log('draft store smoke: all 11 checks passed');
