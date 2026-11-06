import { useDndMonitor } from '@dnd-kit/core'
import { useEffect, useRef, type RefObject } from 'react'
import { prefersReducedMotion } from '../motion'

// Tuning. Velocity is in pixels per millisecond, so a quick flick is roughly 1–3.
const DEGREES_PER_VELOCITY = 6
const MAX_ANGLE_DEGREES = 12
const STIFFNESS = 0.12 // how hard the spring pulls toward the target angle
const DAMPING = 0.25 // how quickly the wobble dies down
const TARGET_DECAY_PER_FRAME = 0.85 // the lean fades when the pointer slows or stops

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

// Makes the dragged card lean into the direction it's moving, like something swinging
// from your fingertip, and spring back upright when it slows down. It writes the
// rotation straight onto the element each animation frame instead of using React state,
// so the card doesn't re-render 60 times a second. Must be used inside a DndContext.
export function useDragSwing(elementRef: RefObject<HTMLElement | null>) {
  const targetAngle = useRef(0)
  const lastMove = useRef<{ x: number; time: number } | null>(null)

  // Turn horizontal drag speed into a target lean angle.
  useDndMonitor({
    onDragStart() {
      lastMove.current = null
      targetAngle.current = 0
    },
    onDragMove(event) {
      const now = performance.now()
      const x = event.delta.x
      const previous = lastMove.current
      if (previous) {
        const elapsed = Math.max(now - previous.time, 1)
        const velocity = (x - previous.x) / elapsed
        targetAngle.current = clamp(
          velocity * DEGREES_PER_VELOCITY,
          -MAX_ANGLE_DEGREES,
          MAX_ANGLE_DEGREES,
        )
      }
      lastMove.current = { x, time: now }
    },
  })

  // A small spring simulation: each frame, accelerate the angle toward the target and
  // apply some damping so it overshoots a little, then settles.
  useEffect(() => {
    const element = elementRef.current
    if (!element || prefersReducedMotion()) return

    let angle = 0
    let angularVelocity = 0
    let previousTime = performance.now()
    let frame = 0

    const step = (now: number) => {
      // Measure in "60fps frames" so the feel is the same on faster screens.
      const frames = Math.min((now - previousTime) / (1000 / 60), 3)
      previousTime = now

      targetAngle.current *= Math.pow(TARGET_DECAY_PER_FRAME, frames)
      const springForce = (targetAngle.current - angle) * STIFFNESS
      const dampingForce = angularVelocity * DAMPING
      angularVelocity += (springForce - dampingForce) * frames
      angle += angularVelocity * frames

      element.style.rotate = `${angle.toFixed(2)}deg`
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [elementRef])
}
