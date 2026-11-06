import {
  COLUMN_IDS,
  type BoardState,
  type Character,
  type ColumnId,
  type Item,
} from '../types'

export type BoardAction =
  | { type: 'ADD_ITEM'; item: Item }
  | { type: 'MOVE_ITEM'; itemId: string; toColumn: ColumnId; toIndex: number }
  | { type: 'REMOVE_ITEM'; itemId: string }

export function emptyBoard(): BoardState {
  return { items: {}, columns: { todo: [], doing: [], done: [] } }
}

export function findColumn(board: BoardState, itemId: string): ColumnId | undefined {
  return COLUMN_IDS.find((columnId) => board.columns[columnId].includes(itemId))
}

// The celebration should only fire when an item arrives in Done, not when it's
// reordered inside Done.
export function isNewlyDone(fromColumn: ColumnId, toColumn: ColumnId): boolean {
  return toColumn === 'done' && fromColumn !== 'done'
}

// Pure function: takes the current board and an action, returns a new board. It never
// edits the old one, which is what lets React notice the change.
export function boardReducer(board: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item } = action
      return {
        items: { ...board.items, [item.id]: item },
        columns: { ...board.columns, todo: [...board.columns.todo, item.id] },
      }
    }

    case 'MOVE_ITEM': {
      const { itemId, toColumn, toIndex } = action
      const fromColumn = findColumn(board, itemId)
      if (!fromColumn) return board

      // Take the id out of its current column, then splice it into the target column.
      // When both are the same column, the second step works on the already-shortened
      // list, which is exactly what a reorder needs.
      const columns = { ...board.columns }
      columns[fromColumn] = columns[fromColumn].filter((id) => id !== itemId)
      const target = [...columns[toColumn]]
      const clampedIndex = Math.max(0, Math.min(toIndex, target.length))
      target.splice(clampedIndex, 0, itemId)
      columns[toColumn] = target

      return { ...board, columns }
    }

    case 'REMOVE_ITEM': {
      const { itemId } = action
      const fromColumn = findColumn(board, itemId)
      if (!fromColumn) return board

      const { [itemId]: _removed, ...remainingItems } = board.items
      return {
        items: remainingItems,
        columns: {
          ...board.columns,
          [fromColumn]: board.columns[fromColumn].filter((id) => id !== itemId),
        },
      }
    }
  }
}

// Sample cards so the board isn't empty on first load. They're built from whatever the
// API returned, so nothing is hardcoded.
const SAMPLES: { title: string; column: ColumnId }[] = [
  { title: 'Fix the portal gun', column: 'todo' },
  { title: 'Finish math homework', column: 'doing' },
  { title: 'Get a summer job', column: 'done' },
  { title: 'Plan family therapy', column: 'todo' },
]

export function initialBoard(characters: Character[]): BoardState {
  const board = emptyBoard()

  SAMPLES.forEach((sample, index) => {
    const character = characters[index]
    if (!character) return

    const id = `sample-${index + 1}`
    board.items[id] = { id, title: sample.title, character }
    board.columns[sample.column].push(id)
  })

  return board
}
