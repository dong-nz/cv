import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { BrowserFrame, Callout, Fade, Label, Mono, PageSkeleton, SceneBackground, SceneChrome } from '../kit';
import { appear, typed } from '../motion';
import { theme } from '../theme';

const BASE_URL = 'cv.vugado.com/projects';
const OLD_TEXT = 'Logistics dashboard';
const NEW_TEXT = 'Logistics platform';

const Pencil: React.FC = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16.5 14 6.5l3.5 3.5L7.5 20H4v-3.5Z" />
    <path d="m12.5 8 3.5 3.5" />
  </svg>
);

const Lock: React.FC = () => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth={2} strokeLinecap="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const Check: React.FC = () => (
  <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={theme.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m7.5 12.5 3 3 6-6.5" />
  </svg>
);

// The stage is centered on x=960 (580–1340) in the band y 200–760 — below the
// title row, above the bullet row. Absolute anchors inside the stage are
// wrapped by a positioned div, never by Fade: Fade's transform would become
// the containing block and anchor them after the skeleton instead of the stage.
export const LiveEdit: React.FC<{ captured: boolean }> = ({ captured }) => {
  const frame = useCurrentFrame();
  const url = typed(BASE_URL, frame, 20, 0.55);
  const query = typed('?edit', frame, 130, 0.35);
  const authIn = appear(frame, 200, 18);
  const authOut = 1 - appear(frame, 285, 18);
  const typedNew = typed(NEW_TEXT, frame, 345, 0.7);
  const saveIn = appear(frame, 445, 20);
  const saveLine = typed('Save → PUT contents/projects.json', frame, 450, 1.1);

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.sans }}>
      <SceneBackground />
      <SceneChrome index="02 · LIVE EDITING" title="?edit turns the live site into the editor" />

      <BrowserFrame
        width={760}
        height={560}
        style={{ left: 580, top: 200 }}
        chrome={
          <div style={{ marginLeft: 14, flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '7px 14px', maxWidth: 520 }}>
              <Mono size={17} color={theme.textSecondary}>{url}</Mono>
              <span style={{ fontFamily: theme.mono, fontSize: 17, color: theme.accent }}>{query}</span>
            </div>
          </div>
        }
      >
        {captured ? (
          <OffthreadVideo
            src={staticFile('inputs/take-edit.mp4')}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <>
            <PageSkeleton active={frame > 300} />

            <div style={{ position: 'absolute', left: 30, top: 22 }}>
              <Fade start={310}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 17, color: theme.textMuted }}>heading</span>
                  <span style={{ background: theme.accentTint, border: `1px solid ${theme.accent}`, borderRadius: 6, padding: 3 }}>
                    <Pencil />
                  </span>
                </div>
              </Fade>
            </div>

            <div style={{ position: 'absolute', left: 34, top: 64, height: 26 }}>
              <span style={{ fontSize: 22, fontWeight: 650, color: theme.textSecondary, opacity: frame > 335 ? 0 : 1 }}>
                {OLD_TEXT}
              </span>
              <span style={{ position: 'absolute', left: 0, fontSize: 22, fontWeight: 650, color: frame > 420 ? theme.textPrimary : theme.accent }}>
                {typedNew}
                {frame > 345 && frame < 430 ? <span style={{ color: theme.accent }}>▍</span> : ''}
              </span>
            </div>

            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, transform: `translateY(${(1 - saveIn) * 70}px)` }}>
              <div style={{ background: theme.elevated, borderTop: `1px solid ${theme.borderStrong}`, padding: '14px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ background: theme.accentTint, border: `1px solid ${theme.accent}`, borderRadius: 6, padding: '5px 12px' }}>
                    <Label size={16} color={theme.accent}>Save</Label>
                  </span>
                  <Mono size={16} color={theme.textMuted}>{saveLine}</Mono>
                </div>
                <Fade start={495}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <Check />
                    <span style={{ fontSize: 17, color: theme.success }}>commit created on branch preview</span>
                  </div>
                </Fade>
                <Fade start={512}>
                  <div style={{ marginTop: 6, fontSize: 15, color: theme.textMuted }}>
                    conflict 409 → three-way rebase keeps your edit
                  </div>
                </Fade>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10, 12, 10, 0.72)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: authIn * authOut,
                pointerEvents: 'none',
              }}
            >
              <div style={{ width: 400, background: theme.surface, border: `1px solid ${theme.borderStrong}`, borderRadius: 12, padding: '26px 30px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Lock />
                  <div>
                    <div style={{ fontSize: 15, color: theme.textMuted }}>cv.vugado.com says</div>
                    <div style={{ fontSize: 21, fontWeight: 650, color: theme.textPrimary }}>Sign in to edit</div>
                  </div>
                </div>
                <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ height: 38, borderRadius: 8, border: `1px solid ${theme.borderStrong}`, background: theme.bg, padding: '9px 12px' }}>
                    <Mono size={16} color={theme.textSecondary}>editor</Mono>
                  </div>
                  <div style={{ height: 38, borderRadius: 8, border: `1px solid ${theme.borderStrong}`, background: theme.bg, padding: '9px 12px' }}>
                    <Mono size={16} color={theme.textSecondary}>••••••••</Mono>
                  </div>
                </div>
                <Fade start={250}>
                  <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ background: theme.accentTint, border: `1px solid ${theme.accent}`, borderRadius: 8, padding: '8px 18px', fontSize: 17, color: theme.accent, fontWeight: 600 }}>
                      Sign in
                    </span>
                  </div>
                </Fade>
                <Fade start={262}>
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
                    <Check />
                  </div>
                </Fade>
              </div>
            </div>
          </>
        )}
      </BrowserFrame>

      <Callout
        target={[1342, 232]}
        anchor={[1367, 228]}
        chip={{ x: 1370, y: 205, width: 330 }}
        start={150}
        accent
      >
        ?edit attaches edit mode — the very page being viewed becomes the editor.
      </Callout>

      <Callout
        target={[578, 450]}
        anchor={[505, 450]}
        chip={{ x: 140, y: 420, width: 360 }}
        start={215}
      >
        HTTP Basic at the nginx proxy is the only gate — the site itself carries no accounts system.
      </Callout>

      <Callout
        target={[578, 242]}
        anchor={[505, 252]}
        chip={{ x: 140, y: 235, width: 360 }}
        start={325}
      >
        Text, tags, records and settings edit inline — pencil-triggered, commit on blur, Vietnamese-IME safe.
      </Callout>

      <Callout
        target={[700, 762]}
        anchor={[700, 795]}
        chip={{ x: 600, y: 800, width: 420 }}
        start={465}
        accent
      >
        Every save is a commit through the GitHub Contents API; a 409 conflict three-way rebases and keeps your edit.
      </Callout>
    </AbsoluteFill>
  );
};
