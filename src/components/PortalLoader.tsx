import { useState } from 'react'
import { Portal } from './Portal'
import styles from './PortalLoader.module.css'

// Evil Morty's avatar, from the Rick and Morty API.
const EVIL_MORTY_IMAGE = 'https://rickandmortyapi.com/api/character/avatar/118.jpeg'

type PortalLoaderProps =
  { status: 'loading' } | { status: 'error'; message: string; onRetry: () => void }

// The full-screen loader shown while the first characters load. If the API can't be
// reached, Evil Morty shows up with a Retry button.
export function PortalLoader(props: PortalLoaderProps) {
  const isError = props.status === 'error'
  // His image comes from the same API that just failed, so it may not load either. If it
  // doesn't, fall back to a stalled portal rather than a broken image.
  const [evilMortyFailed, setEvilMortyFailed] = useState(false)

  let visual = (
    <div className={styles.portalWrap}>
      <Portal />
    </div>
  )
  if (isError && !evilMortyFailed) {
    visual = (
      <img
        className={styles.evilMorty}
        src={EVIL_MORTY_IMAGE}
        alt="Evil Morty"
        onError={() => setEvilMortyFailed(true)}
      />
    )
  } else if (isError) {
    visual = (
      <div className={`${styles.portalWrap} ${styles.closed}`}>
        <Portal />
      </div>
    )
  }

  return (
    <main className={styles.stage}>
      {visual}

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
