import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArrowDefs, Fade, Label, Mono, Panel, SceneBackground, SceneChrome } from '../kit';
import { appear, drawIn } from '../motion';
import { theme } from '../theme';

const TREE = [
  { line: '├── src/data/projects.json', hot: false },
  { line: '├── src/data/pages/*.json', hot: false },
  { line: '├── src/i18n/locales/vi/content/projects.json', hot: false },
  { line: '└── src/i18n/locales/en/content/projects.json', hot: true },
];

// Centered group: tree panel 480–950, branch graph 1010–1410 (center 945≈960).
// Vertical band 200–730 — below the title row, above the bullet row.
export const GitStorage: React.FC = () => {
  const frame = useCurrentFrame();
  const branchDraw = drawIn(frame, 55, 45);
  const mergeDraw = drawIn(frame, 140, 45);
  const branchOn = appear(frame, 100);
  const mergedOn = appear(frame, 185);
  const pulse = interpolate(frame % 50, [0, 25, 50], [0, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const commitOn = appear(frame, 115);

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.sans }}>
      <SceneBackground />
      <SceneChrome
        index="03 · GIT AS THE STORAGE"
        title="A content edit is a file edit"
        bullets={[
          'Drafts live on a branch; master stays the published site',
          'A branch preview is a URL: ?edit=preview',
          'History, review and rollback come from git, free of charge',
        ]}
        bulletStart={70}
      />

      <Panel width={470} style={{ left: 480, top: 200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Label size={18}>the repository</Label>
          <Mono size={14} color={theme.textMuted}>main branch view</Mono>
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TREE.map((t, i) => (
            <Fade key={t.line} start={25 + i * 20}>
              <div
                style={{
                  fontFamily: theme.mono,
                  fontSize: 14,
                  padding: '6px 10px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  color: t.hot ? theme.accent : theme.textSecondary,
                  background: t.hot ? theme.accentTint : 'transparent',
                  border: t.hot ? `1px solid ${theme.accent}` : '1px solid transparent',
                }}
              >
                {t.line}
              </div>
            </Fade>
          ))}
        </div>
      </Panel>

      <Fade start={105} y={20}>
        <Panel width={470} style={{ left: 480, top: 480 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: theme.accent }} />
            <Label size={18} color={theme.accent}>commit: edit projects.json (en)</Label>
          </div>
          <div style={{ marginTop: 14, fontFamily: theme.mono, fontSize: 15, lineHeight: 1.6 }}>
            <div style={{ color: theme.textMuted }}>src/i18n/locales/en/content/projects.json</div>
            <div style={{ color: theme.accent }}>− "summary": "Logistics dashboard…"</div>
            <div style={{ color: theme.success }}>+ "summary": "Logistics platform…"</div>
            <div style={{ color: theme.textMuted }}>1 file changed, 1 insertion(+), 1 deletion(−)</div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', opacity: commitOn }}>
            <span style={{ background: theme.accentTint, border: `1px solid ${theme.accent}`, borderRadius: 6, padding: '4px 10px' }}>
              <Label size={15} color={theme.accent}>+1 −1</Label>
            </span>
            <span style={{ fontSize: 15, color: theme.textMuted }}>the whole diff of a headline change</span>
          </div>
        </Panel>
      </Fade>

      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <ArrowDefs />
        <path d="M 1010 680 L 1410 680" fill="none" stroke={theme.borderStrong} strokeWidth={5} />
        <path
          d="M 1100 680 C 1160 680, 1190 460, 1240 460"
          fill="none"
          stroke={theme.accent}
          strokeWidth={4}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={branchDraw}
        />
        <path
          d="M 1240 460 C 1300 460, 1320 680, 1370 680"
          fill="none"
          stroke={theme.success}
          strokeWidth={4}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={mergeDraw}
          markerEnd={mergeDraw < 0.1 ? 'url(#arrow-success)' : undefined}
        />
        <circle cx={1100} cy={680} r={9} fill={theme.borderStrong} />
        <circle cx={1240} cy={460} r={11} fill={theme.accent} opacity={branchOn} />
        <circle cx={1240} cy={460} r={11 + 12 * pulse} fill="none" stroke={theme.accent} strokeWidth={2} opacity={(1 - pulse) * branchOn} />
        <circle cx={1370} cy={680} r={11} fill={theme.success} opacity={mergedOn} />
      </svg>

      <Fade start={95}>
        <div style={{ position: 'absolute', left: 1110, top: 380, width: 260, textAlign: 'center' }}>
          <Label size={18}>preview branch · drafts</Label>
        </div>
      </Fade>
      <Fade start={10}>
        <div style={{ position: 'absolute', left: 1010, top: 705 }}>
          <Label size={18} color={theme.textMuted}>master · deploys</Label>
        </div>
      </Fade>
      <Fade start={195}>
        <div style={{ position: 'absolute', left: 1250, top: 728 }}>
          <span style={{ background: 'rgba(107, 184, 134, 0.14)', border: `1px solid ${theme.success}`, borderRadius: 8, padding: '6px 12px' }}>
            <Label size={16} color={theme.success}>merge = publish</Label>
          </span>
        </div>
      </Fade>
    </AbsoluteFill>
  );
};
