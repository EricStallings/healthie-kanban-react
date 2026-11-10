import { useEffect, useState } from 'react'
import { fetchCharacters } from '../api/characters'
import type { Character } from '../types'

export const SEARCH_DEBOUNCE_MS = 250

type SearchResponse = { query: string; results: Character[]; hasError: boolean }

// Searches the API by name as the user types. It waits for a short pause before sending,
// and cancels the previous request so an old, slow response can't overwrite a newer one.
// With no query it returns the characters the app already loaded.

export function useCharacterSearch(query: string, defaultCharacters: Character[]) {
  const trimmedQuery = query.trim()
  // The latest answer from the API, tagged with the query it answers.
  const [response, setResponse] = useState<SearchResponse | null>(null)

  // Debounce: wait SEARCH_DEBOUNCE_MS after typing stops, then search.
  useEffect(() => {
    if (!trimmedQuery) return

    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetchCharacters(trimmedQuery, controller.signal)
        .then((results) => setResponse({ query: trimmedQuery, results, hasError: false }))
        .catch(() => {
          if (controller.signal.aborted) return
          setResponse({ query: trimmedQuery, results: [], hasError: true })
        })
    }, SEARCH_DEBOUNCE_MS)

    // Cleanup runs before the next search: cancel the timer and the request.
    return () => {
      clearTimeout(timer)
      controller.abort()
      // Forget the old answer, so retyping an earlier query (one that failed, say)
      // shows "searching" instead of its stale result.
      setResponse(null)
    }
  }, [trimmedQuery])

  if (!trimmedQuery) {
    return { results: defaultCharacters, isSearching: false, hasError: false }
  }

  // Until the answer for the current text arrives, we're still searching.
  if (response?.query !== trimmedQuery) {
    return { results: [], isSearching: true, hasError: false }
  }
  return { results: response.results, isSearching: false, hasError: response.hasError }
}
