import { Portal } from './Portal'
import styles from './PortalLoader.module.css'

type PortalLoaderProps =
  { status: 'loading' } | { status: 'error'; message: string; onRetry: () => void }

// The full-screen loader shown while the first characters load. If the API can't be
// reached, the portal shrinks and fades and a Retry button appears.
export function PortalLoader(props: PortalLoaderProps) {
  const isError = props.status === 'error'

  return (
    <main className={styles.stage}>
      <div
        className={isError ? `${styles.portalWrap} ${styles.closed}` : styles.portalWrap}
      >
        <Portal />
      </div>

      {isError ? (
        <div className={styles.error} role="alert">
          <p className={`brand-text ${styles.errorTitle}`}>
            Couldn't reach the Rick and Morty API
          </p>
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
