import { Portal } from './Portal'
import { SpeechToast } from './SpeechToast'
import styles from './PortalLoader.module.css'

// Evil Morty's avatar, from the Rick and Morty API. If it can't load (it's the same API
// that just failed), SpeechToast hides the image and the bubble still shows.
const EVIL_MORTY_IMAGE = 'https://rickandmortyapi.com/api/character/avatar/118.jpeg'

type PortalLoaderProps =
  { status: 'loading' } | { status: 'error'; message: string; onRetry: () => void }

// The full-screen loader shown while the first characters load. If the API can't be
// reached, Evil Morty breaks the news in a speech bubble, with Retry underneath.
export function PortalLoader(props: PortalLoaderProps) {
  if (props.status === 'error') {
    return (
      <main className={styles.stage}>
        <div role="alert">
          <SpeechToast
            variant="panel"
            tone="evilMorty"
            imageUrl={EVIL_MORTY_IMAGE}
            imageAlt="Evil Morty"
            headline="Your multiverse isn't answering."
            detail={`Couldn't reach the Rick and Morty API (${props.message})`}
          />
        </div>
        <button type="button" className={styles.retryButton} onClick={props.onRetry}>
          Retry
        </button>
      </main>
    )
  }

  return (
    <main className={styles.stage}>
      <div className={styles.portalWrap}>
        <Portal />
      </div>
      <p className={styles.message} role="status">
        Opening a portal to the multiverse…
      </p>
    </main>
  )
}
