import { prefersReducedMotion } from '../motion'
import styles from './Portal.module.css'

// A cartoon-style portal drawn from scratch in SVG: flat greens, spiral arms curling into a
// light center, white foam around the rim, and a ragged edge. Nothing here is traced or
// copied from the show.

const ARM_COUNT = 11
const ARM_COLORS = ['#1c8c38', '#43a83d', '#b3dd5e', '#239439', '#5cb640', '#1c8c38']

// One spiral arm from near the center out to the rim. The angle grows with the radius,
// which is what makes it curl.
function spiralPath(startAngle: number): string {
  const points: string[] = []
  for (let radius = 4; radius <= 86; radius += 2) {
    // A little wobble in the curl so the arms look streaky, not like a neat pinwheel.
    const angle =
      startAngle + radius * 0.065 + Math.sin(radius * 0.25 + startAngle * 3) * 0.12
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M ${points.join(' L ')}`
}

// Same pseudo-random numbers on every render, so the foam doesn't jump around.
function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const ARMS = Array.from({ length: ARM_COUNT }, (_, index) => ({
  path: spiralPath((index / ARM_COUNT) * Math.PI * 2),
  color: ARM_COLORS[index % ARM_COLORS.length],
  width: 3 + seededRandom(index + 300) * 6,
}))

const FOAM = Array.from({ length: 70 }, (_, index) => {
  const angle = (index / 70) * Math.PI * 2 + seededRandom(index) * 0.12
  const distance = 74 + seededRandom(index + 100) * 18
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 1.2 + seededRandom(index + 200) * 3.2,
  }
})

export function Portal({ className = '' }: { className?: string }) {
  // The flickering edge is an SVG animation, which CSS media queries can't slow down.
  const animateEdge = !prefersReducedMotion()

  return (
    <svg
      className={`${styles.portal} ${className}`}
      viewBox="-100 -100 200 200"
      role="img"
      aria-label="Swirling green portal"
    >
      <defs>
        {/* Roughens every edge so it looks hand-drawn instead of perfectly smooth. */}
        <filter id="portal-rough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="7">
            {animateEdge && (
              <animate
                attributeName="seed"
                values="7;19;31;43"
                dur="0.48s"
                calcMode="discrete"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="12" />
        </filter>
        <radialGradient id="portal-center">
          <stop offset="0" stopColor="#c9ea72" />
          <stop offset="0.5" stopColor="#b3dd5e" />
          <stop offset="1" stopColor="#b6e061" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g filter="url(#portal-rough)">
        <circle r="92" fill="#a6d957" />
        <circle r="84" fill="#7cc24a" />
        <g className={styles.arms}>
          {ARMS.map((arm) => (
            <path
              key={arm.path}
              d={arm.path}
              fill="none"
              stroke={arm.color}
              strokeWidth={arm.width}
              strokeLinecap="round"
            />
          ))}
        </g>
        <circle r="26" fill="url(#portal-center)" />
        <g className={styles.foam}>
          {FOAM.map((bubble) => (
            <circle
              key={`${bubble.x}-${bubble.y}`}
              cx={bubble.x}
              cy={bubble.y}
              r={bubble.size}
              fill="#ffffff"
            />
          ))}
        </g>
      </g>
    </svg>
  )
}
