import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Fade, SceneBackground } from '../kit';
import { theme } from '../theme';

export const Title: React.FC = () => (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.sans, justifyContent: 'center', padding: '0 140px' }}>
      <SceneBackground />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(900px 520px at 76% 28%, ${theme.accentSoft}, transparent 70%)`,
          opacity: 0.9,
        }}
      />
      <Fade start={8}>
        <div style={{ color: theme.accent, letterSpacing: '0.18em', fontSize: 22, textTransform: 'uppercase', marginBottom: 30 }}>
          cv.vugado.com · how it works
        </div>
      </Fade>
      <Fade start={28} y={26}>
        <div style={{ fontSize: 74, lineHeight: 1.14, color: theme.textPrimary, fontWeight: 650, maxWidth: 1300 }}>
          This site&apos;s CMS is a <span style={{ color: theme.accent }}>git repository</span>.
        </div>
      </Fade>
      <Fade start={78}>
        <div style={{ fontSize: 30, color: theme.textSecondary, marginTop: 36 }}>
          Live editing on the real pages · git-backed content · automatic deployment
        </div>
      </Fade>
      <Fade start={125}>
        <div style={{ marginTop: 64, color: theme.textMuted, fontSize: 20 }}>
          62 seconds · captions only
        </div>
      </Fade>
    </AbsoluteFill>
);
