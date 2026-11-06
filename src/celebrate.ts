import confetti from 'canvas-confetti'

const PORTAL_GREENS = ['#97ce4c', '#c6ef6e', '#e4f7a8', '#5fae2e', '#69c8ec']

// Confetti burst from a point on screen (in pixels), e.g. where the card was dropped.
// canvas-confetti skips itself for users who prefer reduced motion.
export function celebrate(origin?: { x: number; y: number }) {
  void confetti({
    particleCount: 120,
    spread: 75,
    startVelocity: 38,
    colors: PORTAL_GREENS,
    disableForReducedMotion: true,
    origin: origin
      ? { x: origin.x / window.innerWidth, y: origin.y / window.innerHeight }
      : { x: 0.8, y: 0.5 },
  })
}
