import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { DataLayer } from './scenes/DataLayer';
import { GitStorage } from './scenes/GitStorage';
import { LiveEdit } from './scenes/LiveEdit';
import { Outro } from './scenes/Outro';
import { Pipeline } from './scenes/Pipeline';
import { Title } from './scenes/Title';
import { SCENES, type ExplainerProps } from './timeline';
import { theme } from './theme';

export const Explainer: React.FC<ExplainerProps> = ({ captured }) => (
  <AbsoluteFill style={{ background: theme.bg }}>
    <Sequence durationInFrames={SCENES[0].duration}>
      <Title />
    </Sequence>
    <Sequence from={SCENES[1].from} durationInFrames={SCENES[1].duration}>
      <DataLayer />
    </Sequence>
    <Sequence from={SCENES[2].from} durationInFrames={SCENES[2].duration}>
      <LiveEdit captured={captured} />
    </Sequence>
    <Sequence from={SCENES[3].from} durationInFrames={SCENES[3].duration}>
      <GitStorage />
    </Sequence>
    <Sequence from={SCENES[4].from} durationInFrames={SCENES[4].duration}>
      <Pipeline captured={captured} />
    </Sequence>
    <Sequence from={SCENES[5].from} durationInFrames={SCENES[5].duration}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
