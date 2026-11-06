import { useEffect, useState } from 'react'
import { fetchCharacters } from '../api/characters'
import type { Character } from '../types'

export const SEARCH_DEBOUNCE_MS = 250

// Searches the API by name as the user types. It waits for a short pause before sending,
// and cancels the previous request so an old, slow response can't overwrite a newer one.
// With no query it returns the characters the app already loaded.
export function useCharacterSearch(query: string, defaultCharacters: Character[]) {
  const trimmedQuery = query.trim()
  const [searchResults, setSearchResults] = useState<Character[]>([])
  const [searchedQuery, setSearchedQuery] = useState('')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!trimmedQuery) return

    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetchCharacters(trimmedQuery, controller.signal)
        .then((characters) => {
          setSearchResults(characters)
          setHasError(false)
          setSearchedQuery(trimmedQuery)
        })
        .catch(() => {
          if (controller.signal.aborted) return
          setSearchResults([])
          setHasError(true)
          setSearchedQuery(trimmedQuery)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmedQuery])

  if (!trimmedQuery) {
    return { results: defaultCharacters, isSearching: false, hasError: false }
  }

  // Until the response for the current text arrives, we're still searching.
  const isSearching = searchedQuery !== trimmedQuery
  return {
    results: isSearching ? [] : searchResults,
    isSearching,
    hasError: !isSearching && hasError,
  }
}
