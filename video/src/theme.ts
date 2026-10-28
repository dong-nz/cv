// The video mirrors the site's dark palette (src/index.css :root block) so the
// explainer looks like the product it explains. Values are copied deliberately:
// this project is standalone and cannot import the site's CSS.
export const theme = {
  bg: '#151914',
  surface: '#202423',
  elevated: '#272a28',
  textPrimary: '#f6f5f2',
  textSecondary: '#b7aea0',
  textMuted: '#8f9a8e',
  accent: '#f87171',
  accentSoft: 'rgba(248, 113, 113, 0.12)',
  accentTint: '#2f1e1a',
  border: '#2a3028',
  borderStrong: '#3a403a',
  success: '#4ade80',
  successSoft: 'rgba(74, 222, 128, 0.14)',
  grid: 'rgba(246, 245, 242, 0.06)',
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
};
