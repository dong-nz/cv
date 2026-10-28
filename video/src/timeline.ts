import { z } from 'zod';

// `captured: true` swaps the animated mock-browser stages for real screen
// footage from video/inputs/ (Screenity exports named per inputs/README.md).
// The default render is fully Remotion-native and needs no footage.
export const explainerProps = z.object({ captured: z.boolean().default(false) }).strict();
export type ExplainerProps = z.infer<typeof explainerProps>;

// Scene timeline (30 fps). These boundaries are the source of truth for the
// chapter list and the .vtt caption tracks on the site page.
export const SCENES = [
  { id: 'title', from: 0, duration: 165 },
  { id: 'data', from: 165, duration: 255 },
  { id: 'edit', from: 420, duration: 540 },
  { id: 'git', from: 960, duration: 330 },
  { id: 'pipeline', from: 1290, duration: 360 },
  { id: 'outro', from: 1650, duration: 210 },
] as const;

export const TOTAL_FRAMES = 1860;
