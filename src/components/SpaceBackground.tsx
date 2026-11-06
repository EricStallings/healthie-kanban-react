import styles from './SpaceBackground.module.css'

// A night sky drawn from scratch: purple haze, a green galaxy swirl in the distance, and
// stars. It sits fixed behind everything and ignores the pointer.

// Same pseudo-random numbers on every render, so the stars don't move around.
function seededRandom(seed: number): number {
  const value = Math.sin(seed * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const STARS = Array.from({ length: 180 }, (_, index) => ({
  x: seededRandom(index) * 100,
  y: seededRandom(index + 1000) * 100,
  size: 0.6 + seededRandom(index + 2000) ** 3 * 1.8,
  opacity: 0.35 + seededRandom(index + 3000) * 0.65,
  // About one in eight stars twinkles.
  twinkles: seededRandom(index + 4000) > 0.875,
  delay: seededRandom(index + 5000) * 4,
}))

// Soft spiral arms for the galaxy, the same idea as the portal's arms but wide, blurry,
// and in teal and green so they read like glowing gas.
const GALAXY_ARMS = Array.from({ length: 6 }, (_, armIndex) => {
  const startAngle = (armIndex / 6) * Math.PI * 2
  const points: string[] = []
  for (let radius = 10; radius <= 96; radius += 3) {
    const angle = startAngle + radius * 0.045
    points.push(
      `${(Math.cos(angle) * radius).toFixed(1)},${(Math.sin(angle) * radius).toFixed(1)}`,
    )
  }
  return {
    path: `M ${points.join(' L ')}`,
    color: ['#3fe0b0', '#8be86a', '#2fb8c8', '#5fe08a', '#4fd0c0', '#a0e870'][armIndex],
    width: 7 + (armIndex % 3) * 3,
  }
})

export function SpaceBackground() {
  return (
    <div className={styles.space} aria-hidden="true">
      <div className={styles.haze} />
      <div className={styles.galaxy}>
        <svg className={styles.swirl} viewBox="-100 -100 200 200">
          <defs>
            <filter id="galaxy-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <g filter="url(#galaxy-glow)">
            {GALAXY_ARMS.map((arm) => (
              <path
                key={arm.path}
                d={arm.path}
                fill="none"
                stroke={arm.color}
                strokeWidth={arm.width}
                strokeLinecap="round"
                opacity="0.55"
              />
            ))}
          </g>
        </svg>
        <div className={styles.core} />
      </div>
      <svg className={styles.stars} width="100%" height="100%">
        {STARS.map((star) => (
          <circle
            key={`${star.x}-${star.y}`}
            className={star.twinkles ? styles.twinkle : undefined}
            style={star.twinkles ? { animationDelay: `${star.delay}s` } : undefined}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="#ffffff"
            opacity={star.opacity}
          />
        ))}
      </svg>
    </div>
  )
}
