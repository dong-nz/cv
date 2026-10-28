import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { ArrowDefs, BrowserFrame, Fade, Label, Mono, PageSkeleton, Panel, SceneBackground, SceneChrome } from '../kit';
import { appear, drawIn } from '../motion';
import { theme } from '../theme';

const JOBS = [
  { name: 'build', detail: 'tsc + vite → dist/ · sitemap + robots' },
  { name: 'generate-resume', detail: 'Playwright → EN + VI PDFs' },
  { name: 'deploy', detail: 'rsync dist/ → VPS stack' },
];

// Centered group: push + three job cards span 465–1455 (center 960) at y 210–330;
// infra card and browser occupy y 470–790 — above the bullet row (y 840+).
export const Pipeline: React.FC<{ captured: boolean }> = ({ captured }) => {
  const frame = useCurrentFrame();
  const arrow1 = drawIn(frame, 30, 25);
  const arrow2 = drawIn(frame, 75, 25);
  const arrow3 = drawIn(frame, 120, 25);
  const infraOn = appear(frame, 165);
  const deployed = appear(frame, 235);

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.sans }}>
      <SceneBackground />
      <SceneChrome
        index="04 · AUTO DEPLOYMENT"
        title="Merge to master — the pipeline ships it"
        bullets={[
          'deploy.yml: build · resume PDFs · deploy — three jobs',
          'nginx.conf / compose.yaml changes redeploy the stack itself',
          'No CMS, no manual upload: push to master is the publish button',
        ]}
        bulletStart={70}
      />

      <Fade start={10}>
        <Panel width={210} style={{ left: 465, top: 210 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: theme.success }} />
            <Label size={20}>push to master</Label>
          </div>
          <div style={{ marginTop: 10, fontSize: 15, color: theme.textMuted }}>merge of preview branch</div>
        </Panel>
      </Fade>

      {JOBS.map((j, i) => (
        <Fade key={j.name} start={45 + i * 45} y={20}>
          <Panel width={230} style={{ left: 705 + i * 260, top: 210 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: theme.accent }} />
              <Mono size={18} color={theme.textPrimary}>{j.name}</Mono>
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: theme.textMuted, lineHeight: 1.45 }}>{j.detail}</div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.success} strokeWidth={3} strokeLinecap="round">
                <path d="m5 13 4 4 10-10" />
              </svg>
              <span style={{ fontSize: 14, color: theme.success }}>passed</span>
            </div>
          </Panel>
        </Fade>
      ))}

      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <ArrowDefs />
        <path d="M 680 265 L 700 265" fill="none" stroke={theme.textMuted} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={arrow1} markerEnd="url(#arrow)" />
        <path d="M 940 265 L 960 265" fill="none" stroke={theme.textMuted} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={arrow2} markerEnd="url(#arrow)" />
        <path d="M 1200 265 L 1220 265" fill="none" stroke={theme.textMuted} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={arrow3} markerEnd="url(#arrow)" />
        <path d="M 1160 340 L 1160 465" fill="none" stroke={theme.accent} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={drawIn(frame, 150, 30)} markerEnd="url(#arrow-accent)" />
      </svg>

      <Fade start={160} y={20}>
        <Panel width={440} style={{ left: 465, top: 480, opacity: infraOn }}>
          <Label size={18}>infra follows the same rules</Label>
          <div style={{ marginTop: 10 }}>
            <Mono size={14}>nginx.conf / compose.yaml → deploy-infra.yml</Mono>
          </div>
          <div style={{ marginTop: 8, fontSize: 15, color: theme.textMuted }}>test nginx -t first, then force-recreate + health probe</div>
        </Panel>
      </Fade>

      <Fade start={225} y={24}>
        <BrowserFrame width={460} height={320} style={{ left: 995, top: 470 }}>
          {captured ? (
            <OffthreadVideo
              src={staticFile('inputs/take-pipeline.mp4')}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <>
              <PageSkeleton active={deployed > 0.5} />
              <Fade start={245}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'rgba(10, 12, 10, 0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: theme.accentTint, border: `1px solid ${theme.accent}`, borderRadius: 10, padding: '14px 22px', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth={2.5} strokeLinecap="round">
                      <path d="m5 13 4 4 10-10" />
                    </svg>
                    <span style={{ fontSize: 20, fontWeight: 650, color: theme.accent }}>updated — new text live</span>
                  </div>
                </div>
              </Fade>
            </>
          )}
        </BrowserFrame>
      </Fade>
    </AbsoluteFill>
  );
};
