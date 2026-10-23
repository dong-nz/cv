/**
 * Site identity — deployment-time configuration, not a repository literal
 * (spec-v4-deploy-infra D10/D12). CI supplies SITE_URL / SITE_NAME as Gitea
 * Actions variables on the build and resume jobs; local runs read them from the
 * uncommitted `.env` (see `.env.example`). A missing value fails loudly — a
 * half-configured sitemap, meta block or resume is never emitted.
 *
 * Browser code does not import this module today; the scripts
 * (`generate-sitemap.ts`, `generate-resume.ts`) and the vite build plugin are
 * its consumers.
 */

type EnvRecord = Record<string, string | undefined>;

interface RuntimeProcess {
  env?: EnvRecord;
  loadEnvFile?: (path?: string) => void;
}

// The tsx runtime carries `process`; the app tsconfig (vite/client types only)
// deliberately does not declare it. `typeof` keeps the check safe in any
// runtime; the module is not imported by browser code today.
declare const process: RuntimeProcess | undefined;
const runtimeProcess = typeof process === 'undefined' ? undefined : process;

if (runtimeProcess?.loadEnvFile) {
  try {
    runtimeProcess.loadEnvFile();
  } catch {
    // No local .env — the real environment must carry the values.
  }
}

// `import.meta.env` is typed by vite/client for browser builds and is
// undefined under tsx; the spread covers both worlds.
const env: EnvRecord = { ...import.meta.env, ...runtimeProcess?.env };

function required(name: string, purpose: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(
      `${name} is not set — ${purpose}. Provide it as an environment variable ` +
        `(CI secret) or in the local .env; see .env.example.`,
    );
  }
  return value;
}

/** Canonical origin. Every absolute URL the site publishes derives from this one value. */
export const siteUrl = required(
  'SITE_URL',
  'canonical URLs, the sitemap, robots.txt and resume links are derived from it',
);

export const siteName = required(
  'SITE_NAME',
  'the page title and the Open Graph / Twitter meta are filled from it',
);
