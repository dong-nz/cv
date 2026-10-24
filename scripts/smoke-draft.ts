// Smoke test for the draft store (spec-v4 §5.1, §5.5, §5.6; registry per
// spec-v4-data-organization §6.1; id-union legs per §3.1).
// Run: pnpm tsx scripts/smoke-draft.ts
import { readFileSync } from 'node:fs';
import { DraftStore, applyUnionChanges, bundledBase, diffIdsWithUnions } from '../src/i18n/draft';

const fail = (msg: string): never => {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};

// The file the save pipeline patches.
const TYPES = readFileSync(new URL('../src/types/index.ts', import.meta.url), 'utf8');

const bases = bundledBase();
const store = new DraftStore(structuredClone(bases));

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
const store2 = new DraftStore(structuredClone(bases));
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
const store3 = new DraftStore(structuredClone(bases));
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
const store4 = new DraftStore(structuredClone(bases));
const baseVi = store4.dataOf('profile.vi') as Record<string, Record<string, unknown>>;
delete baseVi.currentInterests;
const tagEdit = store4.setValue('vi', 'profile.currentInterests[0]', 'NEW TAG');
if (tagEdit !== null) fail(`tag edit rejected: ${JSON.stringify(tagEdit)}`);
const arr = (store4.dataOf('profile.vi') as Record<string, Record<string, unknown>>).currentInterests;
if (!Array.isArray(arr)) fail(`setPath made ${JSON.stringify(arr)}, not an array`);
if (arr[0] !== 'NEW TAG') fail('array element not set');

// 9. The shipped documents and the shipped id unions agree. This is the check
// that was missing: a skill group deleted in edit mode left 'logistics-
// technology' in SkillGroupId, and `Record<SkillGroupId, …>` then failed the
// build with TS2741.
const drift = diffIdsWithUnions(new DraftStore(structuredClone(bases)), TYPES);
if (drift.added.length + drift.removed.length > 0)
  fail(`documents and id unions disagree: ${JSON.stringify(drift)}`);

// 10. A deleted record prunes its union member — and only that line, in
// either line ending (git stores LF, a Windows checkout reads CRLF).
const store5 = new DraftStore(structuredClone(bases));
const groupIds = (store5.dataOf('skills') as { id: string }[]).map((g) => g.id);
const victim = groupIds[groupIds.length - 1];
const delGroup = store5.deleteRecord('skill-group', { id: victim });
if (delGroup !== null) fail(`skill-group delete rejected: ${JSON.stringify(delGroup)}`);
const afterDelete = store5.validate();
if (afterDelete.length > 0) fail(`validate after delete: ${JSON.stringify(afterDelete)}`);
// The union leg follows ids whose documents actually landed.
for (const id of ['skills', 'skills.vi', 'skills.en'] as const) store5.markWritten(id, 'simulated-sha');
const stale = diffIdsWithUnions(store5, TYPES);
if (stale.added.length > 0) fail(`a delete reported additions: ${JSON.stringify(stale.added)}`);
if (stale.removed.length !== 1 || stale.removed[0].id !== victim || stale.removed[0].union !== 'SkillGroupId')
  fail(`stale union member not reported: ${JSON.stringify(stale.removed)}`);
const pruned = applyUnionChanges(TYPES, [{ union: 'SkillGroupId', add: [], remove: [victim] }]);
if (pruned === null) fail('prune refused a multi-line union');
if (pruned.includes(`'${victim}'`)) fail('stale member survived the prune');
const EOL = TYPES.includes('\r\n') ? '\r\n' : '\n';
const expectedBlock = `export type SkillGroupId =${EOL}${groupIds
  .filter((id) => id !== victim)
  .map((id) => `  | '${id}'`)
  .join(EOL)};${EOL}`;
const expected = TYPES.replace(/export type SkillGroupId =\r?\n(?:[ \t]*\| '[^']+';?\r?\n)+/, () => expectedBlock);
if (pruned !== expected) fail('prune rewrote more than the SkillGroupId member list');
const afterPrune = diffIdsWithUnions(store5, pruned);
if (afterPrune.added.length + afterPrune.removed.length > 0)
  fail(`union still mismatched after the prune: ${JSON.stringify(afterPrune)}`);
const lfTypes = TYPES.replace(/\r\n/g, '\n');
const prunedLf = applyUnionChanges(lfTypes, [{ union: 'SkillGroupId', add: [], remove: [victim] }]);
if (prunedLf === null) fail('prune refused an LF union');
if (prunedLf.includes('\r\n')) fail('an LF patch introduced CRLF');
if (prunedLf !== expected.replace(/\r\n/g, '\n')) fail('LF patch differs from the LF source');
const afterPruneLf = diffIdsWithUnions(store5, prunedLf);
if (afterPruneLf.added.length + afterPruneLf.removed.length > 0)
  fail(`union still mismatched after the LF prune: ${JSON.stringify(afterPruneLf)}`);

// 11. An id that also reads as a string elsewhere in the file is still
// appended. 'home' is a PageId member, so a substring test would have skipped
// this leg and the build would have broken the other way.
const store6 = new DraftStore(structuredClone(bases));
const addGroup = store6.addRecord('skill-group');
if (addGroup !== null) fail(`skill-group add rejected: ${JSON.stringify(addGroup)}`);
const known = new Set(groupIds);
const created = (store6.dataOf('skills') as { id: string }[]).find((g) => !known.has(g.id));
if (!created) fail('no new skill group created');
const rename = store6.renameRecord('skill-group', { id: created.id }, 'Home');
if (rename !== null) fail(`rename rejected: ${JSON.stringify(rename)}`);
if (!(store6.dataOf('skills') as { id: string }[]).some((g) => g.id === 'home'))
  fail('rename did not apply');
const afterRename = store6.validate();
if (afterRename.length > 0) fail(`validate after rename: ${JSON.stringify(afterRename)}`);
for (const id of ['skills', 'skills.vi', 'skills.en'] as const) store6.markWritten(id, 'simulated-sha');
const missing = diffIdsWithUnions(store6, TYPES);
if (!missing.added.some((a) => a.union === 'SkillGroupId' && a.id === 'home'))
  fail(`id colliding with another union member was not appended: ${JSON.stringify(missing.added)}`);
if (missing.removed.length > 0) fail(`an add reported removals: ${JSON.stringify(missing.removed)}`);
const appended = applyUnionChanges(TYPES, [{ union: 'SkillGroupId', add: ['home'], remove: [] }]);
if (appended === null) fail('append refused a multi-line union');
const afterAppend = diffIdsWithUnions(store6, appended);
if (afterAppend.added.length + afterAppend.removed.length > 0)
  fail(`union still mismatched after the append: ${JSON.stringify(afterAppend)}`);

// 12. An emptied document prunes its union to `never`, and a record added on
// top of that state is appended back rather than silently skipped.
const emptied = applyUnionChanges(TYPES, [{ union: 'SkillGroupId', add: [], remove: groupIds }]);
if (emptied === null) fail('prune of every member refused');
if (!emptied.includes('export type SkillGroupId = never;')) fail('emptied union is not never');
const store7 = new DraftStore(structuredClone(bases));
if (store7.addRecord('skill-group') !== null) fail('skill-group add rejected on a never union');
const addedGroup = (store7.dataOf('skills') as { id: string }[]).find((g) => !known.has(g.id));
if (!addedGroup) fail('no new skill group created for the never case');
for (const id of ['skills', 'skills.vi', 'skills.en'] as const) store7.markWritten(id, 'simulated-sha');
const revived = diffIdsWithUnions(store7, emptied);
if (!revived.added.some((a) => a.union === 'SkillGroupId' && a.id === addedGroup.id))
  fail(`never union skipped the new id: ${JSON.stringify(revived.added)}`);
if (revived.removed.length > 0) fail(`the never case reported removals: ${JSON.stringify(revived.removed)}`);
const back = applyUnionChanges(
  emptied,
  [{ union: 'SkillGroupId', add: revived.added.map((a) => a.id), remove: [] }],
);
if (back === null) fail('append onto never refused');
const afterNever = diffIdsWithUnions(store7, back);
if (afterNever.added.length + afterNever.removed.length > 0)
  fail(`never round-trip left a mismatch: ${JSON.stringify(afterNever)}`);
console.log('draft store smoke: all 12 checks passed');
