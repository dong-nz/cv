import { useMemo, type CSSProperties } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"

/**
 * The dots read as depth because each tier travels through a perspective-projected
 * z range instead of being scaled by hand: a particle at z = -500px is projected at
 * 700 / 1200 = 0.58x, one at z = +120px at 700 / 580 = 1.21x — so the near tier grows *and*
 * fans out away from the vanishing point, which scale() alone cannot fake.
 *
 * `from` / `to` are raw translateY offsets from the top of the layer, tuned per tier
 * so that after projection every tier crosses the whole hero box (derivation in
 * App.css). Same projected distance + longer duration = slower on screen = further away.
 */
interface DepthTier {
  id: "far" | "mid" | "near"
  /** translateZ at 0% (deep) and 100% (towards the viewer) of one cycle, in px */
  z: [number, number]
  /** raw translateY at 0% and 100%, in vh from the top of the layer */
  from: number
  to: number
  size: [number, number]
  opacity: number
  duration: [number, number]
  /** ± lateral sweep in px; projection amplifies it, so the near tier sweeps widest */
  drift: number
  counts: { desktop: number; mobile: number }
  /** px of scroll parallax across SCROLL_RANGE; the near tier moves fastest */
  scrollShift: number
}

const FAR: DepthTier = {
  id: "far",
  z: [-500, -180],
  from: 121,
  to: -29,
  size: [6, 9],
  opacity: 0.22,
  duration: [16, 24],
  drift: 14,
  counts: { desktop: 12, mobile: 6 },
  scrollShift: -30,
}

const MID: DepthTier = {
  id: "mid",
  z: [-300, -60],
  from: 114,
  to: -14,
  size: [7, 11],
  opacity: 0.45,
  duration: [11, 17],
  drift: 26,
  counts: { desktop: 12, mobile: 6 },
  scrollShift: -60,
}

const NEAR: DepthTier = {
  id: "near",
  z: [-120, 120],
  from: 103,
  to: 17,
  size: [7, 12],
  opacity: 0.8,
  duration: [7, 11],
  drift: 40,
  counts: { desktop: 6, mobile: 3 },
  scrollShift: -100,
}

const depthTiers: DepthTier[] = [FAR, MID, NEAR]

const SCROLL_RANGE: [number, number] = [0, 500]

interface Particle {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  drift: number
  opacity: number
}

function createParticles(tier: DepthTier, count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    size: tier.size[0] + Math.random() * (tier.size[1] - tier.size[0]),
    duration: tier.duration[0] + Math.random() * (tier.duration[1] - tier.duration[0]),
    // Applied as a negative animation-delay: every cycle is already in progress at
    // mount, so the hero is populated immediately instead of filling in over 10s.
    delay: Math.random() * tier.duration[1],
    drift: (Math.random() * 2 - 1) * tier.drift,
    opacity: tier.opacity * (0.75 + Math.random() * 0.35),
  }))
}

function particleStyle(particle: Particle, tier: DepthTier): CSSProperties {
  return {
    left: `${particle.left}%`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    animationDuration: `${particle.duration}s`,
    animationDelay: `-${particle.delay}s`,
    "--p-from": `${tier.from}vh`,
    "--p-to": `${tier.to}vh`,
    "--p-z0": `${tier.z[0]}px`,
    "--p-z1": `${tier.z[1]}px`,
    "--p-drift": `${particle.drift}px`,
    "--p-op": particle.opacity,
  } as CSSProperties
}

export function HeroParticles() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const { scrollY } = useScroll()
  const layerY: Record<DepthTier["id"], MotionValue<number>> = {
    far: useTransform(scrollY, SCROLL_RANGE, [0, FAR.scrollShift]),
    mid: useTransform(scrollY, SCROLL_RANGE, [0, MID.scrollShift]),
    near: useTransform(scrollY, SCROLL_RANGE, [0, NEAR.scrollShift]),
  }
  const layers = useMemo(
    () =>
      depthTiers.map((tier) => ({
        tier,
        particles: createParticles(tier, isMobile ? tier.counts.mobile : tier.counts.desktop),
      })),
    [isMobile],
  )

  return (
    <div className="hero-particles" aria-hidden="true">
      {layers.map(({ tier, particles }) => (
        <motion.div
          key={tier.id}
          className={`hero-particle-layer hero-particle-layer--${tier.id}`}
          style={{ y: layerY[tier.id] }}
        >
          {particles.map((particle) => (
            <div key={particle.id} className="hero-particle" style={particleStyle(particle, tier)} />
          ))}
        </motion.div>
      ))}
    </div>
  )
}
