import styles from './SpaceBackground.module.css'

// A night sky drawn from scratch in SVG. The nebula is fractal noise (feTurbulence) colored
// and thresholded into wispy gas, then shaped by a few big blurred blobs so it forms an
// irregular band. Darker noise on top makes dust lanes. Nothing is copied from a photo.

// Same pseudo-random numbers on every render, so the stars don't move around.
function seededRandom(seed: number): number {
  const value = Math.sin(seed * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const WIDTH = 1600
const HEIGHT = 1000

// Tiny background stars scattered everywhere.
const DUST_STARS = Array.from({ length: 420 }, (_, index) => ({
  x: seededRandom(index) * WIDTH,
  y: seededRandom(index + 1000) * HEIGHT,
  size: 0.4 + seededRandom(index + 2000) ** 4 * 1.6,
  opacity: 0.3 + seededRandom(index + 3000) * 0.7,
}))

// A few bigger stars with a soft glow. Some twinkle.
const GLOW_STARS = Array.from({ length: 26 }, (_, index) => ({
  x: seededRandom(index + 6000) * WIDTH,
  y: seededRandom(index + 7000) * HEIGHT,
  size: 1.4 + seededRandom(index + 8000) * 1.6,
  glow: 8 + seededRandom(index + 9000) * 18,
  twinkles: index % 3 === 0,
  delay: seededRandom(index + 9500) * 5,
}))

// The two brightest stars sit inside the nebula, like in a real nebula photo.
const BRIGHT_STARS = [
  { x: 690, y: 250, glow: 90 },
  { x: 980, y: 610, glow: 110 },
]

// Big soft blobs that decide where the gas is, running diagonally across the sky.
const NEBULA_SHAPE = [
  { x: 520, y: 260, radiusX: 260, radiusY: 170 },
  { x: 760, y: 380, radiusX: 300, radiusY: 210 },
  { x: 930, y: 560, radiusX: 330, radiusY: 200 },
  { x: 1150, y: 700, radiusX: 260, radiusY: 160 },
  { x: 640, y: 560, radiusX: 180, radiusY: 140 },
]

type GasLayer = {
  id: string
  color: [number, number, number] // 0–1 RGB
  frequency: number // smaller = bigger, softer clouds
  seed: number
  strength: number // how much of the noise becomes visible gas
  threshold: number
  opacity: number
}

const GAS_LAYERS: GasLayer[] = [
  // Broad purple haze behind everything.
  {
    id: 'gas-purple',
    color: [0.42, 0.26, 0.78],
    frequency: 0.0028,
    seed: 3,
    strength: 2.4,
    threshold: 0.75,
    opacity: 0.85,
  },
  // The main teal-green cloud.
  {
    id: 'gas-teal',
    color: [0.24, 0.85, 0.66],
    frequency: 0.0042,
    seed: 11,
    strength: 3.2,
    threshold: 1.35,
    opacity: 0.8,
  },
  // Brighter green wisps.
  {
    id: 'gas-green',
    color: [0.6, 0.92, 0.45],
    frequency: 0.007,
    seed: 23,
    strength: 3.6,
    threshold: 1.9,
    opacity: 0.6,
  },
  // A touch of magenta.
  {
    id: 'gas-magenta',
    color: [0.78, 0.35, 0.78],
    frequency: 0.005,
    seed: 41,
    strength: 3,
    threshold: 1.6,
    opacity: 0.55,
  },
  // Fine, pale wisps for texture.
  {
    id: 'gas-pale',
    color: [0.88, 0.92, 1],
    frequency: 0.012,
    seed: 57,
    strength: 3.4,
    threshold: 2.1,
    opacity: 0.35,
  },
]

function GasFilter({ layer }: { layer: GasLayer }) {
  const [red, green, blue] = layer.color
  return (
    <filter id={layer.id} x="0" y="0" width="100%" height="100%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency={layer.frequency}
        numOctaves={5}
        seed={layer.seed}
      />
      {/* Paint the noise one color, and only keep the denser parts as gas. */}
      <feColorMatrix
        values={`0 0 0 0 ${red}
                 0 0 0 0 ${green}
                 0 0 0 0 ${blue}
                 ${layer.strength} 0 0 0 -${layer.threshold}`}
      />
      <feGaussianBlur stdDeviation={1.2} />
    </filter>
  )
}

export function SpaceBackground() {
  return (
    <div className={styles.space} aria-hidden="true">
      <svg
        className={styles.sky}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {GAS_LAYERS.map((layer) => (
            <GasFilter key={layer.id} layer={layer} />
          ))}

          {/* Dark dust lanes: the same noise trick, but painted near-black. */}
          <filter id="gas-dust" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.006}
              numOctaves={4}
              seed={77}
            />
            <feColorMatrix
              values="0 0 0 0 0.03
                      0 0 0 0 0.03
                      0 0 0 0 0.09
                      3.4 0 0 0 -1.6"
            />
            <feGaussianBlur stdDeviation={2} />
          </filter>

          <filter id="shape-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={90} />
          </filter>

          {/* Where gas is allowed: white = visible, black = hidden. */}
          <mask id="nebula-shape">
            <rect width={WIDTH} height={HEIGHT} fill="#000" />
            <g filter="url(#shape-blur)">
              {NEBULA_SHAPE.map((blob) => (
                <ellipse
                  key={`${blob.x}-${blob.y}`}
                  cx={blob.x}
                  cy={blob.y}
                  rx={blob.radiusX}
                  ry={blob.radiusY}
                  fill="#fff"
                />
              ))}
            </g>
          </mask>
        </defs>

        {/* A faint glow where the nebula is, so the gas sits on light, not black. */}
        <g mask="url(#nebula-shape)">
          <rect width={WIDTH} height={HEIGHT} fill="#2a2370" opacity="0.55" />
          {GAS_LAYERS.map((layer) => (
            <rect
              key={layer.id}
              width={WIDTH}
              height={HEIGHT}
              filter={`url(#${layer.id})`}
              opacity={layer.opacity}
            />
          ))}
          <rect width={WIDTH} height={HEIGHT} filter="url(#gas-dust)" opacity="0.8" />
        </g>
      </svg>

      {/* Stars get their own layer, so twinkling doesn't make the browser redraw the
          nebula's noise filters every frame. Same viewBox, so they line up. */}
      <svg
        className={styles.sky}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="star-glow">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="0.25" stopColor="#d9d2ff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#8a7aff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {DUST_STARS.map((star) => (
          <circle
            key={`${star.x}-${star.y}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="#fff"
            opacity={star.opacity}
          />
        ))}

        {GLOW_STARS.map((star) => (
          <g
            key={`${star.x}-${star.y}`}
            className={star.twinkles ? styles.twinkle : undefined}
            style={star.twinkles ? { animationDelay: `${star.delay}s` } : undefined}
          >
            <circle cx={star.x} cy={star.y} r={star.glow} fill="url(#star-glow)" />
            <circle cx={star.x} cy={star.y} r={star.size} fill="#fff" />
          </g>
        ))}

        {BRIGHT_STARS.map((star) => (
          <g key={`${star.x}-${star.y}`}>
            <circle cx={star.x} cy={star.y} r={star.glow} fill="url(#star-glow)" />
            <circle cx={star.x} cy={star.y} r={star.glow * 0.35} fill="url(#star-glow)" />
            <circle cx={star.x} cy={star.y} r={3.5} fill="#fff" />
          </g>
        ))}
      </svg>
    </div>
  )
}
