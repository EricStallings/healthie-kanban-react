import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Character } from '../../types'
import { NewItemForm } from './NewItemForm'

const rick: Character = { id: '1', name: 'Rick Sanchez', image: 'rick.jpeg' }
const morty: Character = { id: '2', name: 'Morty Smith', image: 'morty.jpeg' }

function renderForm() {
  const onAdd = vi.fn()
  render(<NewItemForm defaultCharacters={[rick, morty]} onAdd={onAdd} />)
  return {
    onAdd,
    titleInput: screen.getByRole('textbox', { name: 'Title' }),
    characterInput: screen.getByRole('combobox', { name: 'Character' }),
    addButton: screen.getByRole('button', { name: 'Add item' }),
  }
}

describe('NewItemForm', () => {
  it('keeps Add disabled until there is a title and a character', async () => {
    const user = userEvent.setup()
    const { titleInput, characterInput, addButton } = renderForm()
    expect(addButton).toBeDisabled()

    await user.type(titleInput, 'Fix the portal gun')
    expect(addButton).toBeDisabled()

    await user.click(characterInput)
    await user.click(screen.getByRole('option', { name: 'Rick Sanchez' }))
    expect(addButton).toBeEnabled()
  })

  it('treats a whitespace-only title as empty', async () => {
    const user = userEvent.setup()
    const { titleInput, characterInput, addButton } = renderForm()

    await user.click(characterInput)
    await user.click(screen.getByRole('option', { name: 'Morty Smith' }))
    await user.type(titleInput, '    ')

    expect(addButton).toBeDisabled()
  })

  it('adds the trimmed title with the chosen character, then clears the form', async () => {
    const user = userEvent.setup()
    const { onAdd, titleInput, characterInput, addButton } = renderForm()

    await user.type(titleInput, '  Finish math homework  ')
    await user.click(characterInput)
    await user.click(screen.getByRole('option', { name: 'Morty Smith' }))
    await user.click(addButton)

    expect(onAdd).toHaveBeenCalledWith('Finish math homework', morty)
    expect(titleInput).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'Character' })).toHaveValue('')
    expect(addButton).toBeDisabled()
  })

  it('clears the picked character when the user types something else', async () => {
    const user = userEvent.setup()
    const { titleInput, characterInput, addButton } = renderForm()

    await user.type(titleInput, 'Plan family therapy')
    await user.click(characterInput)
    await user.click(screen.getByRole('option', { name: 'Rick Sanchez' }))
    expect(addButton).toBeEnabled()

    await user.type(characterInput, 'x')
    expect(addButton).toBeDisabled()
    // Their text stays put, it isn't wiped.
    expect(characterInput).toHaveValue('Rick Sanchezx')
  })

  it('puts focus back on the title after adding, ready for the next item', async () => {
    const user = userEvent.setup()
    const { titleInput, characterInput } = renderForm()

    await user.type(titleInput, 'Get a summer job')
    await user.click(characterInput)
    await user.click(screen.getByRole('option', { name: 'Morty Smith' }))
    await user.click(screen.getByRole('button', { name: 'Add item' }))

    expect(titleInput).toHaveFocus()
  })
})
