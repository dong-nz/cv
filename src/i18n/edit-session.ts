// The edit-mode session state (spec-v4 §5.2, §6.2): the `?edit` entry, the
// sessionStorage flags that keep a session in the mode across navigation and
// reloads, and the target branch. Dependency-free on purpose — App.tsx reads
// the mode gate from here, and that import must not pull the draft store or
// the save pipeline into the entry chunk (spec-v4 §7 P3.4). The Basic-auth
// handshake that needs them stays in `edit-mode.ts`.
const EDIT_FLAG = 'portfolio-edit';
const BRANCH_FLAG = 'portfolio-edit-branch';
export const DRAFT_STORAGE = 'portfolio-draft';

// The repository's default branch — what a bare `?edit` targets.
export const DEFAULT_BRANCH = 'master';

// Git's own ref rules, reduced to what a working branch name can be: no
// leading '-' or '/', no '..', no '//', no trailing '/', no `.lock` suffix,
// and only characters safe in a URL query value.
const BRANCH_RE = /^(?!-)(?!\/)(?!.*\.\.)(?!.*\/\/)(?!.*\.lock$)(?!.*\/$)[A-Za-z0-9][A-Za-z0-9._/-]{0,63}$/;

export function editRequested(search: string): boolean {
  return new URLSearchParams(search).has('edit');
}

// `?edit` or `?edit=1` → undefined (fall back to the session's branch, or
// the default); `?edit=<branch>` → that branch; an illegal name → null (the
// shell exits edit mode the same way it does on a failed auth).
export function requestedBranch(search: string): string | null | undefined {
  const value = new URLSearchParams(search).get('edit');
  if (!value || value === '1') return undefined;
  return BRANCH_RE.test(value) ? value : null;
}

export function getEditBranch(): string {
  const saved = sessionStorage.getItem(BRANCH_FLAG);
  return saved && BRANCH_RE.test(saved) ? saved : DEFAULT_BRANCH;
}

export function setEditBranch(branch: string): void {
  sessionStorage.setItem(BRANCH_FLAG, branch);
}

// The mode is a session, not a URL state (owner request 2026-10-24): `?edit`
// opens it, the flag keeps it while the user moves through the site, and only
// the EditBar's Exit clears it. Every internal link the shell hands the router
// carries `?edit`, so the URL and the flag agree in practice; the flag is what
// survives a back navigation to an address taken before edit mode opened.
export function hasEditFlag(): boolean {
  return sessionStorage.getItem(EDIT_FLAG) === '1';
}

export function setEditFlag(on: boolean): void {
  if (on) sessionStorage.setItem(EDIT_FLAG, '1');
  else {
    sessionStorage.removeItem(EDIT_FLAG);
    sessionStorage.removeItem(BRANCH_FLAG);
  }
}

export function clearDraftStorage(): void {
  sessionStorage.removeItem(DRAFT_STORAGE);
}
