import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api/characters'
import type { Character } from '../types'
import { useCharacterSearch } from './useCharacterSearch'

const rick: Character = { id: '1', name: 'Rick Sanchez', image: 'rick.jpeg' }
const meeseeks: Character = { id: '242', name: 'Mr. Meeseeks', image: 'meeseeks.jpeg' }
const defaults = [rick]

describe('useCharacterSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the already-loaded characters when there is no query', () => {
    const fetchSpy = vi.spyOn(api, 'fetchCharacters')
    const { result } = renderHook(() => useCharacterSearch('   ', defaults))

    expect(result.current).toEqual({
      results: defaults,
      isSearching: false,
      hasError: false,
    })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('waits for a pause in typing before searching', async () => {
    const fetchSpy = vi.spyOn(api, 'fetchCharacters').mockResolvedValue([meeseeks])
    const { result, rerender } = renderHook(
      ({ query }) => useCharacterSearch(query, defaults),
      { initialProps: { query: 'm' } },
    )

    rerender({ query: 'mee' })
    rerender({ query: 'meeseeks' })
    expect(result.current.isSearching).toBe(true)

    await act(() => vi.advanceTimersByTimeAsync(300))

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy).toHaveBeenCalledWith('meeseeks', expect.any(AbortSignal))
    expect(result.current).toEqual({
      results: [meeseeks],
      isSearching: false,
      hasError: false,
    })
  })

  it('cancels the previous request when the query changes', async () => {
    const signals: AbortSignal[] = []
    vi.spyOn(api, 'fetchCharacters').mockImplementation((_name, signal) => {
      if (signal) signals.push(signal)
      return new Promise(() => {}) // never resolves
    })
    const { rerender } = renderHook(({ query }) => useCharacterSearch(query, defaults), {
      initialProps: { query: 'rick' },
    })
    await act(() => vi.advanceTimersByTimeAsync(300))

    rerender({ query: 'morty' })

    expect(signals[0].aborted).toBe(true)
  })

  it('reports an error instead of results when the search fails', async () => {
    vi.spyOn(api, 'fetchCharacters').mockRejectedValue(new Error('Network down'))
    const { result } = renderHook(() => useCharacterSearch('rick', defaults))

    await act(() => vi.advanceTimersByTimeAsync(300))

    expect(result.current).toEqual({ results: [], isSearching: false, hasError: true })
  })

  it('does not show an old error when the same query is typed again', async () => {
    const fetchSpy = vi
      .spyOn(api, 'fetchCharacters')
      .mockRejectedValueOnce(new Error('Network down'))
      .mockImplementationOnce(() => new Promise(() => {})) // second try is still in flight
    const { result, rerender } = renderHook(
      ({ query }) => useCharacterSearch(query, defaults),
      { initialProps: { query: 'ab' } },
    )
    await act(() => vi.advanceTimersByTimeAsync(300))
    expect(result.current.hasError).toBe(true)

    rerender({ query: '' })
    rerender({ query: 'ab' })

    expect(result.current).toEqual({ results: [], isSearching: true, hasError: false })
    await act(() => vi.advanceTimersByTimeAsync(300))
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})
