import styles from './SpeechToast.module.css'

type SpeechToastProps = {
  imageUrl: string
  imageAlt: string
  headline: string
  detail: string
  tone: 'meeseeks' | 'poopybutthole'
}

// A character headshot next to a speech bubble. Used as custom toast content.
export function SpeechToast({
  imageUrl,
  imageAlt,
  headline,
  detail,
  tone,
}: SpeechToastProps) {
  return (
    <div className={`${styles.toast} ${styles[tone]}`}>
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
