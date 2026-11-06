import { useRef, useState, type FormEvent } from 'react'
import type { Character } from '../../types'
import { CharacterPicker } from '../CharacterPicker'
import styles from './NewItemForm.module.css'

type NewItemFormProps = {
  defaultCharacters: Character[]
  onAdd: (title: string, character: Character) => void
}

// Title + character. Add stays disabled until both are filled in, since every item
// needs a character.
export function NewItemForm({ defaultCharacters, onAdd }: NewItemFormProps) {
  const [title, setTitle] = useState('')
  const [character, setCharacter] = useState<Character | null>(null)
  // Changing the key remounts the picker, which clears its search text after adding.
  const [pickerKey, setPickerKey] = useState(0)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const trimmedTitle = title.trim()
  const canSubmit = trimmedTitle.length > 0 && character !== null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    onAdd(trimmedTitle, character)
    setTitle('')
    setCharacter(null)
    setPickerKey((previous) => previous + 1)
    // The Add button disables itself, which would drop focus to nowhere. Send it back to
    // the title so the next item can be typed right away.
    titleInputRef.current?.focus()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Add an item">
      <label className="visually-hidden" htmlFor="new-item-title">
        Title
      </label>
      <input
        id="new-item-title"
        ref={titleInputRef}
        className={styles.titleInput}
        placeholder="What needs doing?"
        value={title}
        maxLength={120}
        autoComplete="off"
        onChange={(event) => setTitle(event.target.value)}
      />
      <CharacterPicker
        key={pickerKey}
        defaultCharacters={defaultCharacters}
        selectedCharacter={character}
        onChange={setCharacter}
      />
      <button type="submit" className={styles.addButton} disabled={!canSubmit}>
        Add item
      </button>
    </form>
  )
}
