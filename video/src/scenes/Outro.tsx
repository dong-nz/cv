import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Fade, Mono, SceneBackground } from '../kit';
import { theme } from '../theme';

export const Outro: React.FC = () => (
  <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.sans, justifyContent: 'center', alignItems: 'center' }}>
    <SceneBackground />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(1000px 560px at 50% 45%, ${theme.accentSoft}, transparent 70%)`,
      }}
    />
    <Fade start={20} y={24}>
      <div style={{ fontSize: 52, color: theme.textPrimary, fontWeight: 650 }}>Edit on the live site.</div>
    </Fade>
    <Fade start={55} y={24}>
      <div style={{ fontSize: 52, color: theme.textPrimary, fontWeight: 650, marginTop: 18 }}>
        Stored in <span style={{ color: theme.accent }}>git</span>.
      </div>
    </Fade>
    <Fade start={90} y={24}>
      <div style={{ fontSize: 52, color: theme.textPrimary, fontWeight: 650, marginTop: 18 }}>
        Live on merge to <span style={{ color: theme.success }}>master</span>.
      </div>
    </Fade>
    <Fade start={145}>
      <div style={{ marginTop: 70, display: 'flex', gap: 26, alignItems: 'baseline' }}>
        <Mono size={24} color={theme.accent}>cv.vugado.com</Mono>
        <Mono size={20}>github.com/dong-nz/cv</Mono>
      </div>
    </Fade>
  </AbsoluteFill>
);
