import { useMemo } from "react"

export function HeroParticles() {
  const count = typeof window !== "undefined" && window.innerWidth < 768 ? 15 : 30
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${Math.random() * 10 + 8}s`,
        delay: `${Math.random() * 10}s`,
        size: `${Math.random() * 10 + 6}px`,
      })),
    [count],
  )

  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="hero-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
