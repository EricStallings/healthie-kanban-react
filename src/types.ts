// A character from the Rick and Morty API, trimmed to what the board shows.
export type Character = {
  id: string
  name: string
  image: string
}

export const COLUMN_IDS = ['todo', 'doing', 'done'] as const
export type ColumnId = (typeof COLUMN_IDS)[number]

export const COLUMN_TITLES: Record<ColumnId, string> = {
  todo: 'To Do',
  doing: 'Doing',
  done: 'Done',
}

// The character is copied onto the item when it's created, so a card never needs
// another API call to render.
export type Item = {
  id: string
  title: string
  character: Character
}

// Items are stored once by id, and each column keeps the order of its ids. Moving a
// card only touches the id lists, never the item itself.
export type BoardState = {
  items: Record<string, Item>
  columns: Record<ColumnId, string[]>
}
