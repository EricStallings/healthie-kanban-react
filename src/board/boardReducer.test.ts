import { describe, expect, it } from 'vitest'
import type { BoardState, Character, Item } from '../types'
import {
  boardReducer,
  emptyBoard,
  findColumn,
  initialBoard,
  isNewlyDone,
} from './boardReducer'

const rick: Character = { id: '1', name: 'Rick Sanchez', image: 'rick.jpeg' }
const morty: Character = { id: '2', name: 'Morty Smith', image: 'morty.jpeg' }

function makeItem(id: string, character: Character = rick): Item {
  return { id, title: `Item ${id}`, character }
}

function boardWith(columns: BoardState['columns']): BoardState {
  const allIds = [...columns.todo, ...columns.doing, ...columns.done]
  const items = Object.fromEntries(allIds.map((id) => [id, makeItem(id)]))
  return { items, columns }
}

describe('boardReducer', () => {
  it('adds a new item to the bottom of To Do', () => {
    const board = boardWith({ todo: ['a'], doing: [], done: [] })
    const next = boardReducer(board, { type: 'ADD_ITEM', item: makeItem('b', morty) })

    expect(next.columns.todo).toEqual(['a', 'b'])
    expect(next.items.b.character.name).toBe('Morty Smith')
  })

  it('moves an item to another column at a given position', () => {
    const board = boardWith({ todo: ['a', 'b'], doing: ['c', 'd'], done: [] })
    const next = boardReducer(board, {
      type: 'MOVE_ITEM',
      itemId: 'a',
      toColumn: 'doing',
      toIndex: 1,
    })

    expect(next.columns.todo).toEqual(['b'])
    expect(next.columns.doing).toEqual(['c', 'a', 'd'])
  })

  it('reorders an item within the same column', () => {
    const board = boardWith({ todo: ['a', 'b', 'c'], doing: [], done: [] })
    const next = boardReducer(board, {
      type: 'MOVE_ITEM',
      itemId: 'a',
      toColumn: 'todo',
      toIndex: 2,
    })

    expect(next.columns.todo).toEqual(['b', 'c', 'a'])
  })

  it('moves an item into an empty column', () => {
    const board = boardWith({ todo: ['a'], doing: [], done: [] })
    const next = boardReducer(board, {
      type: 'MOVE_ITEM',
      itemId: 'a',
      toColumn: 'done',
      toIndex: 0,
    })

    expect(next.columns.todo).toEqual([])
    expect(next.columns.done).toEqual(['a'])
  })

  it('clamps an out-of-range index to the end of the column', () => {
    const board = boardWith({ todo: ['a'], doing: ['b'], done: [] })
    const next = boardReducer(board, {
      type: 'MOVE_ITEM',
      itemId: 'a',
      toColumn: 'doing',
      toIndex: 99,
    })

    expect(next.columns.doing).toEqual(['b', 'a'])
  })

  it('ignores a move for an item that does not exist', () => {
    const board = boardWith({ todo: ['a'], doing: [], done: [] })
    const next = boardReducer(board, {
      type: 'MOVE_ITEM',
      itemId: 'missing',
      toColumn: 'done',
      toIndex: 0,
    })

    expect(next).toBe(board)
  })

  it('removes an item from its column and from the items map', () => {
    const board = boardWith({ todo: ['a'], doing: ['b'], done: [] })
    const next = boardReducer(board, { type: 'REMOVE_ITEM', itemId: 'b' })

    expect(next.columns.doing).toEqual([])
    expect(next.items.b).toBeUndefined()
    expect(next.items.a).toBeDefined()
  })

  it('does not change the previous state', () => {
    const board = boardWith({ todo: ['a', 'b'], doing: [], done: [] })
    boardReducer(board, { type: 'MOVE_ITEM', itemId: 'a', toColumn: 'done', toIndex: 0 })

    expect(board.columns.todo).toEqual(['a', 'b'])
    expect(board.columns.done).toEqual([])
  })
})

describe('findColumn', () => {
  it('returns the column holding the item, or undefined', () => {
    const board = boardWith({ todo: ['a'], doing: ['b'], done: [] })

    expect(findColumn(board, 'b')).toBe('doing')
    expect(findColumn(board, 'missing')).toBeUndefined()
  })
})

describe('isNewlyDone', () => {
  it('is true only when an item arrives in Done from another column', () => {
    expect(isNewlyDone('doing', 'done')).toBe(true)
    expect(isNewlyDone('todo', 'done')).toBe(true)
    expect(isNewlyDone('done', 'done')).toBe(false)
    expect(isNewlyDone('todo', 'doing')).toBe(false)
  })
})

describe('initialBoard', () => {
  it('starts empty when there are no characters', () => {
    expect(initialBoard([])).toEqual(emptyBoard())
  })

  it('seeds sample items across the columns from the fetched characters', () => {
    const summer: Character = { id: '3', name: 'Summer Smith', image: 'summer.jpeg' }
    const beth: Character = { id: '4', name: 'Beth Smith', image: 'beth.jpeg' }
    const board = initialBoard([rick, morty, summer, beth])

    const counts = [board.columns.todo, board.columns.doing, board.columns.done].map(
      (column) => column.length,
    )
    expect(counts).toEqual([2, 1, 1])
    expect(Object.keys(board.items)).toHaveLength(4)
    const allCharacters = Object.values(board.items).map((item) => item.character.name)
    expect(allCharacters).toEqual(
      expect.arrayContaining([
        'Rick Sanchez',
        'Morty Smith',
        'Summer Smith',
        'Beth Smith',
      ]),
    )
  })
})
