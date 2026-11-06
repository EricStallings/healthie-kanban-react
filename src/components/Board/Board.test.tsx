import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { describe, expect, it } from 'vitest'
import { boardReducer } from '../../board/boardReducer'
import type { BoardState, Character } from '../../types'
import { Board } from './Board'

const rick: Character = { id: '1', name: 'Rick Sanchez', image: 'rick.jpeg' }
const morty: Character = { id: '2', name: 'Morty Smith', image: 'morty.jpeg' }

const startingBoard: BoardState = {
  items: {
    portal: { id: 'portal', title: 'Fix the portal gun', character: rick },
    homework: { id: 'homework', title: 'Finish math homework', character: morty },
  },
  columns: { todo: ['portal'], doing: ['homework'], done: [] },
}

// The real reducer, so the test checks what the user sees, not just that an action fired.
function BoardWithState() {
  const [board, dispatch] = useReducer(boardReducer, startingBoard)
  return <Board board={board} dispatch={dispatch} />
}

describe('Board', () => {
  it('removes a card when its remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<BoardWithState />)
    const todoColumn = screen.getByRole('region', { name: /To Do/ })
    expect(within(todoColumn).getByText('Fix the portal gun')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove "Fix the portal gun"' }))

    expect(screen.queryByText('Fix the portal gun')).not.toBeInTheDocument()
    expect(within(todoColumn).getByText('Drop items here')).toBeInTheDocument()
    // The other column is untouched.
    expect(screen.getByText('Finish math homework')).toBeInTheDocument()
  })
})
