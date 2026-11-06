import styles from './SpeechToast.module.css'

type SpeechToastProps = {
  imageUrl: string
  imageAlt: string
  headline: string
  detail: string
  tone: 'meeseeks' | 'poopybutthole' | 'evilMorty'
  // "toast" slams in at normal size; "panel" is bigger and doesn't animate (error screen).
  variant?: 'toast' | 'panel'
}

// A character headshot next to a speech bubble. Used for the toasts and the error screen.
export function SpeechToast({
  imageUrl,
  imageAlt,
  headline,
  detail,
  tone,
  variant = 'toast',
}: SpeechToastProps) {
  return (
    <div className={`${styles.toast} ${styles[tone]} ${styles[variant]}`}>
      <div className={styles.bubble}>
        <strong className={styles.headline}>{headline}</strong>
        <span className={styles.detail}>{detail}</span>
      </div>
      <img
        className={styles.headshot}
        src={imageUrl}
        alt={imageAlt}
        // If the headshot can't load, hide it and keep the text.
        onError={(event) => {
          event.currentTarget.hidden = true
        }}
      />
    </div>
  )
}
