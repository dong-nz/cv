import React from 'react';
import { useCurrentFrame } from 'remotion';
import { appear, drawIn } from './motion';
import { theme } from './theme';

export const Fade: React.FC<{ start: number; y?: number; children: React.ReactNode }> = ({
  start,
  y = 16,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = appear(frame, start);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px)` }}>{children}</div>
  );
};

export const SceneChrome: React.FC<{ index: string; title: string }> = ({ index, title }) => (
  <div style={{ position: 'absolute', top: 80, left: 120 }}>
    <Fade start={4}>
      <div style={{ fontSize: 20, letterSpacing: '0.22em', color: theme.accent }}>{index}</div>
    </Fade>
    <Fade start={14} y={20}>
      <div style={{ fontSize: 44, fontWeight: 650, color: theme.textPrimary, marginTop: 10 }}>
        {title}
      </div>
    </Fade>
  </div>
);

// A callout that points at a diagram element: the leader line draws only after
// the target has appeared, and the chip only after the line completes — the
// scene's explanations therefore follow the diagram beat by beat instead of
// sitting in a fixed text row. `target` is the anchor on the element, `anchor`
// the chip-side end of the line.
export const Callout: React.FC<{
  target: [number, number];
  anchor: [number, number];
  chip: { x: number; y: number; width: number };
  start: number;
  accent?: boolean;
  children: string;
}> = ({ target, anchor, chip, start, accent, children }) => {
  const frame = useCurrentFrame();
  const line = drawIn(frame, start, 12);
  const chipOn = appear(frame, start + 12);
  return (
    <>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line
          x1={target[0]}
          y1={target[1]}
          x2={anchor[0]}
          y2={anchor[1]}
          stroke={accent ? theme.accent : theme.borderStrong}
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={line}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: chip.x,
          top: chip.y,
          width: chip.width,
          opacity: chipOn,
          transform: `translateY(${(1 - chipOn) * 10}px)`,
          background: theme.surface,
          border: `1px solid ${accent ? theme.accent : theme.borderStrong}`,
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 15,
          color: theme.textSecondary,
          lineHeight: 1.45,
        }}
      >
        {children}
      </div>
    </>
  );
};

export const Panel: React.FC<{
  width: number;
  accent?: boolean;
  success?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, accent, success, children, style }) => (
  <div
    style={{
      position: 'absolute',
      width,
      background: theme.surface,
      border: `1px solid ${accent ? theme.accent : success ? theme.success : theme.borderStrong}`,
      borderRadius: 10,
      padding: '16px 20px',
      boxShadow: accent ? `0 0 32px ${theme.accentSoft}` : success ? `0 0 32px ${theme.successSoft}` : 'none',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Mono: React.FC<{ children: string; size?: number; color?: string }> = ({
  children,
  size = 20,
  color = theme.textMuted,
}) => (
  <span style={{ fontFamily: theme.mono, fontSize: size, color }}>{children}</span>
);

export const Label: React.FC<{ children: string; size?: number; color?: string }> = ({
  children,
  size = 20,
  color = theme.textPrimary,
}) => (
  <span style={{ fontSize: size, fontWeight: 600, color }}>{children}</span>
);

// The recurring mock-browser stage. `chrome` is the URL-bar row content; the
// caller animates everything below it.
export const BrowserFrame: React.FC<{
  width: number;
  height: number;
  chrome?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, chrome, children, style }) => (
  <div
    style={{
      position: 'absolute',
      width,
      height,
      borderRadius: 14,
      border: `1px solid ${theme.borderStrong}`,
      background: theme.bg,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
      ...style,
    }}
  >
    <div
      style={{
        minHeight: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        background: theme.elevated,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <span style={{ width: 11, height: 11, borderRadius: 6, background: theme.borderStrong }} />
      <span style={{ width: 11, height: 11, borderRadius: 6, background: theme.borderStrong }} />
      <span style={{ width: 11, height: 11, borderRadius: 6, background: theme.borderStrong }} />
      {chrome}
    </div>
    <div style={{ flex: 1, position: 'relative' }}>{children}</div>
  </div>
);

// A paragraph of grey blocks — the universal "rendered page" stand-in.
export const PageSkeleton: React.FC<{ active?: boolean }> = ({ active }) => (
  <div style={{ padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div
      style={{
        width: '55%',
        height: 26,
        borderRadius: 6,
        background: active ? theme.accentTint : '#2c302d',
        border: active ? `1px solid ${theme.accent}` : '1px solid transparent',
      }}
    />
    {[92, 84, 88, 70].map((w, i) => (
      <div key={i} style={{ width: `${w}%`, height: 12, borderRadius: 4, background: '#262a27' }} />
    ))}
  </div>
);

export const SceneBackground: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`,
      backgroundSize: '64px 64px',
    }}
  />
);

// Arrowhead shared by every connector drawing.
export const ArrowDefs: React.FC = () => (
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill={theme.textMuted} />
    </marker>
    <marker id="arrow-accent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill={theme.accent} />
    </marker>
  </defs>
);
