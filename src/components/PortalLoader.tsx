import styles from './PortalLoader.module.css'

type PortalLoaderProps =
  { status: 'loading' } | { status: 'error'; message: string; onRetry: () => void }

// The full-screen loader shown while the first characters load. The portal is drawn
// entirely with CSS gradients plus an SVG filter that makes its edge wobble, so there are
// no images from the show in the repo.
export function PortalLoader(props: PortalLoaderProps) {
  const isError = props.status === 'error'

  return (
    <main className={styles.stage}>
      <svg width="0" height="0" className={styles.filterDefinitions} aria-hidden="true">
        <filter id="portal-wobble">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="2"
            seed="3"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="3s"
              values="0.03;0.045;0.03"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" />
        </filter>
      </svg>

      <div className={isError ? `${styles.portal} ${styles.closed}` : styles.portal}>
        <div className={styles.outerSwirl} />
        <div className={styles.innerSwirl} />
        <div className={styles.core} />
      </div>

      {isError ? (
        <div className={styles.error} role="alert">
          <p className={styles.errorTitle}>Couldn't reach the Rick and Morty API</p>
          <p className={styles.errorDetail}>{props.message}</p>
          <button type="button" className={styles.retryButton} onClick={props.onRetry}>
            Retry
          </button>
        </div>
      ) : (
        <p className={styles.message} role="status">
          Opening a portal to the multiverse…
        </p>
      )}
    </main>
  )
}
