import { z } from 'zod';

// `captured: true` swaps the animated mock-browser stages for real screen
// footage from video/inputs/ (Screenity exports named per inputs/README.md).
// The default render is fully Remotion-native and needs no footage.
export const explainerProps = z.object({ captured: z.boolean().default(false) }).strict();
export type ExplainerProps = z.infer<typeof explainerProps>;

// Scene timeline (30 fps). These boundaries are the source of truth for the
// chapter list and the .vtt caption tracks on the site page.
// Dwell rule: every callout chip stays on screen at least 150 frames (5 s)
// before its scene switches — a ~25-word chip needs a calm read, not a glance.
// Scene beats are unchanged; the added frames are hold time at the end.
export const SCENES = [
  { id: 'title', from: 0, duration: 165 },
  { id: 'data', from: 165, duration: 420 },
  { id: 'edit', from: 585, duration: 700 },
  { id: 'git', from: 1285, duration: 420 },
  { id: 'pipeline', from: 1705, duration: 510 },
  { id: 'outro', from: 2215, duration: 210 },
] as const;

export const TOTAL_FRAMES = 2425;
