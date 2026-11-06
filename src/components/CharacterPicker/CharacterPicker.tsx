import { useCombobox } from 'downshift'
import { useState } from 'react'
import { useCharacterSearch } from '../../hooks/useCharacterSearch'
import type { Character } from '../../types'
import styles from './CharacterPicker.module.css'

type CharacterPickerProps = {
  defaultCharacters: Character[]
  selectedCharacter: Character | null
  onChange: (character: Character | null) => void
}

// A searchable dropdown. It opens on the characters we already loaded and searches the API
// as you type. Downshift handles the keyboard and screen reader behavior (arrow keys,
// Enter, Escape, ARIA roles), and we handle what it looks like.
export function CharacterPicker({
  defaultCharacters,
  selectedCharacter,
  onChange,
}: CharacterPickerProps) {
  const [inputValue, setInputValue] = useState('')

  // After picking, the input shows the character's name. Don't search for that, just show
  // the default list again if the menu is reopened.
  const query = inputValue === selectedCharacter?.name ? '' : inputValue
  const { results, isSearching, hasError } = useCharacterSearch(query, defaultCharacters)

  const {
    isOpen,
    highlightedIndex,
    getLabelProps,
    getInputProps,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
  } = useCombobox<Character>({
    items: results,
    itemToString: (character) => character?.name ?? '',
    itemToKey: (character) => character?.id,
    selectedItem: selectedCharacter,
    // Downshift owns the text in the box; we keep a copy only to drive the search.
    onInputValueChange: ({ inputValue: nextValue, type }) => {
      setInputValue(nextValue)
      // Typing something new clears the old pick, so the form can't submit a character
      // that no longer matches what's in the box.
      if (
        type === useCombobox.stateChangeTypes.InputChange &&
        selectedCharacter &&
        nextValue !== selectedCharacter.name
      ) {
        onChange(null)
      }
    },
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem ?? null),
    // When we clear the pick because the user edited the text, Downshift would normally
    // reset the box to the empty item's text (""). Keep what they typed instead.
    stateReducer: (state, { type, changes }) => {
      if (type === useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem) {
        return { ...changes, inputValue: state.inputValue }
      }
      return changes
    },
  })

  let statusMessage: string | null = null
  if (isSearching) statusMessage = 'Searching the multiverse…'
  else if (hasError) statusMessage = "Couldn't search right now. Try again."
  else if (results.length === 0) statusMessage = 'No characters found'

  return (
    <div className={styles.picker}>
      <label className="visually-hidden" {...getLabelProps()}>
        Character
      </label>
      <div className={styles.inputRow}>
        {selectedCharacter && (
          <img className={styles.selectedAvatar} src={selectedCharacter.image} alt="" />
        )}
        <input
          className={styles.input}
          placeholder="Pick a character"
          // Downshift opens the menu on click, and on the down arrow from the keyboard.
          {...getInputProps()}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label="Show characters"
          {...getToggleButtonProps()}
        >
          ▾
        </button>
      </div>

      <div className={`${styles.menu} ${isOpen ? styles.open : ''}`}>
        <ul className={styles.options} {...getMenuProps()}>
          {isOpen &&
            results.map((character, index) => (
              <li
                key={character.id}
                className={[
                  styles.option,
                  highlightedIndex === index ? styles.highlighted : '',
                  selectedCharacter?.id === character.id ? styles.selected : '',
                ].join(' ')}
                {...getItemProps({ item: character, index })}
              >
                <img
                  className={styles.optionAvatar}
                  src={character.image}
                  alt=""
                  loading="lazy"
                />
                {character.name}
              </li>
            ))}
        </ul>
        {/* Outside the list (a listbox may only contain options), and announced politely
            to screen readers. */}
        <div className={styles.status} role="status" aria-live="polite">
          {isOpen ? statusMessage : null}
        </div>
      </div>
    </div>
  )
}
