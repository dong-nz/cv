// Throwaway smoke test for the draft store (spec-v4 §5.1, §5.5, §5.6).
// Run: pnpm tsx scripts/smoke-draft.ts
import { DraftStore, bundledBase } from '../src/i18n/draft';

const fail = (msg: string): never => {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};

const bases = bundledBase();
const store = new DraftStore(structuredClone(bases));

const projects = store.dataOf('projects') as { id: string }[];
const firstProject = projects[0].id;

// 1. setValue on a text path is accepted and tracked.
const rejected = store.setValue('vi', `projects.${firstProject}.summary`, 'SUMMARY CHANGED');
if (rejected !== null) fail(`valid edit rejected: ${JSON.stringify(rejected)}`);
if (!store.isDirty()) fail('store not dirty after accepted edit');
const paths = store.changedPaths('content.vi');
if (!paths.includes(`projects.${firstProject}.summary`)) fail(`path not diffed: ${paths}`);

// 2. Empty required value is rejected and leaves the draft untouched.
const before = structuredClone(store.dataOf('content.vi'));
const empty = store.setValue('vi', 'profile.bio', '   ');
if (empty === null) fail('empty required value accepted');
if (JSON.stringify(store.dataOf('content.vi')) !== JSON.stringify(before)) fail('rejected edit mutated draft');

// 3. Delete removes the structure record AND both text entries — no orphan.
const del = store.deleteRecord('project', { id: firstProject });
if (del !== null) fail(`delete rejected: ${JSON.stringify(del)}`);
const stillListed = (store.dataOf('projects') as { id: string }[]).some((p) => p.id === firstProject);
if (stillListed) fail('project still in structure after delete');
const vi = store.dataOf('content.vi') as Record<string, Record<string, unknown>>;
const en = store.dataOf('content.en') as Record<string, Record<string, unknown>>;
if (vi.projects[firstProject]) fail('vi text orphan after delete');
if (en.projects[firstProject]) fail('en text orphan after delete');
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
(driftedBase['content.vi'].data as Record<string, Record<string, string>>).projects[firstProject].summary = 'THEIRS';
store2.resetBase('content.vi', driftedBase['content.vi']);
const rebaseIssues = store2.rebase('content.vi');
if (rebaseIssues === null) fail('rebase silently took one side on a real conflict');
store2.discardDocument('content.vi');
if (store2.isPathDirty(`projects.${firstProject}.summary`)) fail('take-theirs left draft residue');

// 7. Clean rebase: base changed at a DIFFERENT path → draft edit survives.
const store3 = new DraftStore(structuredClone(bases));
store3.setValue('vi', `projects.${firstProject}.summary`, 'MINE');
const otherBase = structuredClone(bases);
const otherId = projects[1].id;
(otherBase['content.vi'].data as Record<string, Record<string, string>>).projects[otherId].summary = 'THEIRS';
store3.resetBase('content.vi', otherBase['content.vi']);
const clean = store3.rebase('content.vi');
if (clean !== null) fail(`clean rebase rejected: ${JSON.stringify(clean)}`);
const merged = (store3.dataOf('content.vi') as Record<string, Record<string, string>>).projects;
if (merged[firstProject].summary !== 'MINE') fail('rebase lost the draft edit');
if (merged[otherId].summary !== 'THEIRS') fail('rebase lost the base edit');

console.log('draft store smoke: all 7 checks passed');
