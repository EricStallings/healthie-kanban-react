import { useCallback, useEffect, useState } from 'react'
import { fetchCharacters } from '../api/characters'
import type { Character } from '../types'

// Keep the portal up at least this long so a fast response doesn't make it flash.
export const MINIMUM_LOADER_MS = 500

export type CharactersState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; characters: Character[] }

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

// Loads the first page of characters when the app starts.
export function useCharacters() {
  const [state, setState] = useState<CharactersState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([fetchCharacters('', controller.signal), wait(MINIMUM_LOADER_MS)])
      .then(([characters]) => setState({ status: 'ready', characters }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : String(error)
        setState({ status: 'error', message })
      })

    // Cancel the request if the component unmounts or retries before it finishes.
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((previous) => previous + 1)
  }, [])

  return { state, retry }
}
