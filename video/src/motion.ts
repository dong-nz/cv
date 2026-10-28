import { interpolate } from 'remotion';

// Every reveal in the film is the same primitive: a frame window mapped to
// opacity 0→1 with a short rise. Scenes stay consistent because nothing
// hand-rolls its own fade.
export const appear = (frame: number, start: number, duration = 14): number =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// Frame-driven substring for the typing effects (URLs, commands, edited text).
export const typed = (text: string, frame: number, start: number, charsPerFrame: number): string => {
  const n = Math.floor((frame - start) * charsPerFrame);
  return text.slice(0, Math.max(0, Math.min(text.length, n)));
};

// Stroke-draw progress for SVG connectors: 1 hides the path, 0 reveals it.
export const drawIn = (frame: number, start: number, duration: number): number =>
  interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
