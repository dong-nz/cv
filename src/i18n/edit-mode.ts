// Edit-mode authentication (spec-v4 §5.2): the Basic-auth handshake through the
// protected proxy endpoint. The protected endpoint is the security boundary —
// edit mode is only a UI affordance. The `?edit` entry, the session flags and
// the branch rules live in `edit-session.ts`, which App.tsx reads without
// pulling this file's dependency on the draft store into the entry chunk.
import { PROXY_BASE } from './draft';
import { hasEditFlag } from './edit-session';

// The probe must not be a draft document: every page manifest claims `profile`
// (the footer renders `profile.name` on every route), so probing
// `src/data/profile.json` made the auth check and the page's own document read
// fetch the identical URL twice per session (owner report 2026-10-25). AGENTS.md
// is a stable, tracked file on every branch, and the proxy passes any repository
// path through unchanged.
const PROBE_FILE = 'AGENTS.md';

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
