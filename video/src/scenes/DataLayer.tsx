import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArrowDefs, BrowserFrame, Fade, Label, Mono, PageSkeleton, Panel, SceneBackground, SceneChrome } from '../kit';
import { appear, drawIn } from '../motion';
import { theme } from '../theme';

// Composition: the visual group is centered on x=960 inside the band
// y 220–670 — below the title row (y 80–175), above the bullet row (y 840+).
const DOCS = [
  { label: 'Structure', path: 'src/data/*.json', note: 'ids · order · links' },
  { label: 'Text — per language', path: 'src/i18n/locales/{vi,en}/…', note: 'every word, both languages' },
  { label: 'Manifests', path: 'src/data/pages/*.json', note: 'which page renders which field' },
];

export const DataLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const joinOn = appear(frame, 120);
  const pageOn = appear(frame, 175);
  const arrowA = drawIn(frame, 95, 35);
  const arrowB = drawIn(frame, 150, 35);
  const pulse = interpolate(frame % 60, [0, 30, 60], [0, 0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.sans }}>
      <SceneBackground />
      <SceneChrome
        index="01 · CONTENT AS DOCUMENTS"
        title="Everything the site shows is a JSON document"
        bullets={[
          'Structure documents — language-neutral ids and order',
          'Per-language dictionaries — EN and VI text, joined at build time',
          'Field manifests — a missing key fails the build, never the page',
        ]}
        bulletStart={70}
      />

      {DOCS.map((d, i) => (
        <Fade key={d.path} start={30 + i * 28} y={22}>
          <Panel width={360} style={{ left: 420, top: 220 + i * 165 }}>
            <Label size={22}>{d.label}</Label>
            <div style={{ marginTop: 8 }}>
              <Mono size={18}>{d.path}</Mono>
            </div>
            <div style={{ marginTop: 6, fontSize: 16, color: theme.textMuted }}>{d.note}</div>
          </Panel>
        </Fade>
      ))}

      <Fade start={110} y={18}>
        <Panel width={240} accent style={{ left: 900, top: 410, textAlign: 'center', background: theme.accentTint }}>
          <Label size={24} color={theme.accent}>joined once</Label>
          <div style={{ marginTop: 6, fontSize: 16, color: theme.textSecondary }}>at build time</div>
          <div
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: 14,
              border: `1px solid ${theme.accent}`,
              opacity: pulse,
            }}
          />
        </Panel>
      </Fade>

      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <ArrowDefs />
        {DOCS.map((_, i) => (
          <path
            key={i}
            d={`M 785 ${280 + i * 165} C 830 ${280 + i * 165}, 845 ${455}, 895 455`}
            fill="none"
            stroke={theme.textMuted}
            strokeWidth={2}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={arrowA}
            markerEnd="url(#arrow)"
            opacity={0.8}
          />
        ))}
        <path
          d="M 1145 455 L 1195 455"
          fill="none"
          stroke={theme.accent}
          strokeWidth={2.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={arrowB}
          markerEnd="url(#arrow-accent)"
        />
      </svg>

      <Fade start={165} y={24}>
        <BrowserFrame width={300} height={420} style={{ left: 1200, top: 245 }}>
          <div style={{ display: 'flex', gap: 8, padding: '14px 16px 0' }}>
            {['EN', 'VI'].map((l, i) => (
              <span
                key={l}
                style={{
                  fontFamily: theme.mono,
                  fontSize: 14,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: `1px solid ${i === 0 ? theme.accent : theme.borderStrong}`,
                  color: i === 0 ? theme.accent : theme.textMuted,
                }}
              >
                {l}
              </span>
            ))}
          </div>
          <PageSkeleton active={joinOn > 0.5} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: theme.accent, opacity: pageOn }} />
        </BrowserFrame>
      </Fade>
    </AbsoluteFill>
  );
};
