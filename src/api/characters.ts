import type { Character } from '../types'

export const RICK_AND_MORTY_API_URL = 'https://rickandmortyapi.com/graphql'

// The API returns 20 characters per page. An empty name means "no filter", which gives
// the first page (Rick, Morty, Summer, Beth, Jerry, ...).
const CHARACTERS_QUERY = `
  query Characters($name: String) {
    characters(filter: { name: $name }) {
      results {
        id
        name
        image
      }
    }
  }
`

type CharactersResponse = {
  data?: { characters: { results: Character[] } | null } | null
  errors?: { message: string }[]
}

// GraphQL over plain fetch: it's one POST with a query string and variables, so a client
// library like Apollo would be more to explain than it saves.
export async function fetchCharacters(
  name = '',
  signal?: AbortSignal,
): Promise<Character[]> {
  const response = await fetch(RICK_AND_MORTY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: CHARACTERS_QUERY, variables: { name: name.trim() } }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Rick and Morty API responded with ${response.status}`)
  }

  const payload: CharactersResponse = await response.json()
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '))
  }

  return payload.data?.characters?.results ?? []
}
