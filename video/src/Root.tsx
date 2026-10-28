import React from 'react';
import { Composition } from 'remotion';
import { Explainer } from './Explainer';
import { TOTAL_FRAMES, explainerProps } from './timeline';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Explainer"
      component={Explainer}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
      schema={explainerProps}
      defaultProps={{ captured: false }}
    />
  </>
);
