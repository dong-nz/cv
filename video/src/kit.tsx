import React from 'react';
import { useCurrentFrame } from 'remotion';
import { appear } from './motion';
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

export const SceneChrome: React.FC<{
  index: string;
  title: string;
  bullets: string[];
  bulletStart?: number;
}> = ({ index, title, bullets, bulletStart = 60 }) => (
  <>
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
    <div style={{ position: 'absolute', left: 120, bottom: 90, maxWidth: 700 }}>
      {bullets.map((b, i) => (
        <Fade key={i} start={bulletStart + i * 40}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            <span style={{ color: theme.accent, fontSize: 22, lineHeight: 1.45 }}>▸</span>
            <span style={{ fontSize: 23, color: theme.textSecondary, lineHeight: 1.45 }}>{b}</span>
          </div>
        </Fade>
      ))}
    </div>
  </>
);

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
