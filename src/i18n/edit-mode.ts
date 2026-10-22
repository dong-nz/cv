// Edit-mode session mechanics (spec-v4 §5.2, §6.2): the `?edit` entry, the
// sessionStorage flags that keep a session in the mode across reloads, the
// target branch (`?edit=<branch>`), and the Basic-auth handshake through the
// protected proxy endpoint. The protected endpoint is the security boundary —
// edit mode is only a UI affordance.
import { PROXY_BASE } from './draft';

const EDIT_FLAG = 'portfolio-edit';
const BRANCH_FLAG = 'portfolio-edit-branch';
export const DRAFT_STORAGE = 'portfolio-draft';

// The repository's default branch — what a bare `?edit` targets.
export const DEFAULT_BRANCH = 'master';

const PROBE_FILE = 'src/data/profile.json';

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

function probeUrl(branch: string, cacheBust: boolean): string {
  const url = new URL(`${PROXY_BASE}${PROBE_FILE}`, window.location.origin);
  url.searchParams.set('ref', branch);
  if (cacheBust) url.searchParams.set('probe', String(Date.now()));
  return url.pathname + url.search;
}

async function checkAuth(branch: string): Promise<boolean> {
  try {
    const res = await fetch(probeUrl(branch, false));
    return res.ok;
  } catch {
    return false;
  }
}

export function probeEditorAuth(branch: string): Promise<boolean> {
  const { promise, resolve } = Promise.withResolvers<boolean>();
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  let settled = false;
  const settle = (ok: boolean) => {
    if (settled) return;
    settled = true;
    iframe.remove();
    resolve(ok);
  };
  iframe.onload = () => {
    void checkAuth(branch).then(settle);
  };
  iframe.src = probeUrl(branch, true);
  document.body.appendChild(iframe);
  return promise;
}

// A session that already holds the flag re-checks silently first: the browser
// re-attaches cached Basic credentials on its own, so no prompt appears again
// unless the cache is gone (new tab) — then the probe runs as on first entry.
export async function ensureEditorAuth(branch: string): Promise<boolean> {
  if (hasEditFlag()) {
    const cached = await checkAuth(branch);
    if (cached) return true;
  }
  return probeEditorAuth(branch);
}
