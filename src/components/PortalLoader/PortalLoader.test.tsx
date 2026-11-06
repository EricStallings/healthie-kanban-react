import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PortalLoader } from './PortalLoader'

describe('PortalLoader', () => {
  it('shows the portal while loading', () => {
    render(<PortalLoader status="loading" />)

    expect(screen.getByRole('img', { name: 'Swirling green portal' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Opening a portal to the multiverse',
    )
  })

  it('shows Evil Morty and the error on failure, and Retry calls onRetry', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<PortalLoader status="error" message="Failed to fetch" onRetry={onRetry} />)

    expect(screen.getByRole('img', { name: 'Evil Morty' })).toBeInTheDocument()
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent("Your multiverse isn't answering.")
    expect(alert).toHaveTextContent(
      "Couldn't reach the Rick and Morty API (Failed to fetch)",
    )

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
