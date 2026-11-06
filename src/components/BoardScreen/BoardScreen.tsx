import { useReducer } from 'react'
import { boardReducer, initialBoard } from '../../board/boardReducer'
import type { Character } from '../../types'
import { Board } from '../Board'
import { NewItemForm } from '../NewItemForm'
import { showItemCreatedToast } from '../../toasts'
import styles from './BoardScreen.module.css'

type BoardScreenProps = {
  characters: Character[]
}

// The main screen, shown once characters have loaded. It owns the board state.
export function BoardScreen({ characters }: BoardScreenProps) {
  // The third argument builds the starting board once, from the loaded characters.
  const [board, dispatch] = useReducer(boardReducer, characters, initialBoard)
  const itemCount = Object.keys(board.items).length

  function handleAdd(title: string, character: Character) {
    dispatch({ type: 'ADD_ITEM', item: { id: crypto.randomUUID(), title, character } })
    showItemCreatedToast(title)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <span className={styles.logo} aria-hidden="true" />
        <h1 className={`brand-text ${styles.title}`}>Interdimensional Kanban</h1>
        <span className={styles.itemCount}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </header>

      <main className={styles.main}>
        <NewItemForm defaultCharacters={characters} onAdd={handleAdd} />
        <Board board={board} dispatch={dispatch} />
      </main>
    </div>
  )
}
