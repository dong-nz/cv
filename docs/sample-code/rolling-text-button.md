```typescript
"use client"

import { motion, useReducedMotion } from "motion/react"
import { useRef, useState } from "react"

const outgoingVariants = {
  rest: { transform: "translateY(0%)" },
  active: { transform: "translateY(100%)" },
}

const incomingVariants = {
  rest: { transform: "translateY(-100%)" },
  active: { transform: "translateY(0%)" },
}

const transition = {
  duration: 0.3,
  ease: [0.338, 0.015, 0.395, 0.959] as const,
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export default function RollingTextButton() {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(false)
  const activeRef = useRef(false)
  const animating = useRef(false)
  const pendingRequest = useRef<boolean | null>(null)
  const hovered = useRef(false)
  const focused = useRef(false)

  const updateActive = (next: boolean) => {
    activeRef.current = next
    setActive(next)
  }

  const requestActive = (next: boolean) => {
    if (reduceMotion) return

    if (next === activeRef.current) {
      pendingRequest.current = null
      return
    }

    if (animating.current) {
      pendingRequest.current = next
      return
    }

    animating.current = true
    updateActive(next)
  }

  const completeAnimation = () => {
    if (!animating.current) return
    animating.current = false

    if (
      pendingRequest.current !== null &&
      pendingRequest.current !== activeRef.current
    ) {
      const next = pendingRequest.current
      pendingRequest.current = null
      animating.current = true
      updateActive(next)
    } else {
      pendingRequest.current = null
    }
  }

  return (
    <main className="rolling-button-stage fresh-system">
      <motion.button
        type="button"
        className="fresh-primary-action"
        aria-label="Start free"
        onHoverStart={() => {
          hovered.current = true
          requestActive(true)
        }}
        onHoverEnd={() => {
          hovered.current = false
          requestActive(focused.current)
        }}
        onFocus={() => {
          focused.current = true
          requestActive(true)
        }}
        onBlur={() => {
          focused.current = false
          requestActive(hovered.current)
        }}
      >
        <span className="fresh-primary-action-content" aria-hidden="true">
          <span className="label-window">
            <motion.span
              className="label-copy"
              variants={outgoingVariants}
              initial="rest"
              animate={active ? "active" : "rest"}
              onAnimationComplete={completeAnimation}
              transition={transition}
            >
              Start free
            </motion.span>
            <motion.span
              className="label-copy label-copy--incoming"
              variants={incomingVariants}
              initial="rest"
              animate={active ? "active" : "rest"}
              transition={transition}
            >
              Start free
            </motion.span>
          </span>
          <span>
            <ChevronRightIcon />
          </span>
        </span>
      </motion.button>
      <Stylesheet />
    </main>
  )
}

function Stylesheet() {
  return (
    <style>{`
      html, body {
        margin: 0;
        min-height: 100%;
      }

      .rolling-button-stage,
      .rolling-button-stage * {
        box-sizing: border-box;
      }

      .rolling-button-stage {
        --fresh-accent: var(--lab-blueberry);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 100vh;
      }

      .label-window {
        position: relative;
        display: block;
        width: max-content;
        overflow: hidden;
      }

      .label-copy {
        display: block;
        white-space: nowrap;
      }

      .label-copy--incoming {
        position: absolute;
        inset: 0;
      }

      @media (hover: hover) {
        .rolling-button-stage .fresh-primary-action:hover {
          border-color: var(--fresh-primary-background);
        }
      }

    `}</style>
  )
}

```