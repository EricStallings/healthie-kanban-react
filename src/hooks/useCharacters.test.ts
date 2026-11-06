import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api/characters'
import { useCharacters } from './useCharacters'

const rick = { id: '1', name: 'Rick Sanchez', image: 'rick.jpeg' }

describe('useCharacters', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts loading, then becomes ready with the characters', async () => {
    vi.spyOn(api, 'fetchCharacters').mockResolvedValue([rick])

    const { result } = renderHook(() => useCharacters())
    expect(result.current.state.status).toBe('loading')

    await act(() => vi.advanceTimersByTimeAsync(600))
    expect(result.current.state).toEqual({ status: 'ready', characters: [rick] })
  })

  it('stays on the loader for the minimum time even if the API is instant', async () => {
    vi.spyOn(api, 'fetchCharacters').mockResolvedValue([rick])

    const { result } = renderHook(() => useCharacters())
    await act(() => vi.advanceTimersByTimeAsync(100))

    expect(result.current.state.status).toBe('loading')
  })

  it('shows an error when the API fails, and retry tries again', async () => {
    const fetchSpy = vi
      .spyOn(api, 'fetchCharacters')
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValueOnce([rick])

    const { result } = renderHook(() => useCharacters())
    await waitFor(() => expect(result.current.state.status).toBe('error'))
    expect(result.current.state).toEqual({ status: 'error', message: 'Network down' })

    act(() => result.current.retry())
    expect(result.current.state.status).toBe('loading')

    await act(() => vi.advanceTimersByTimeAsync(600))
    expect(result.current.state.status).toBe('ready')
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})
