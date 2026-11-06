import { describe, expect, it, vi } from 'vitest'
import { fetchCharacters, RICK_AND_MORTY_API_URL } from './characters'

function mockFetchResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const response = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  }
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(response as Response)
}

const rick = { id: '1', name: 'Rick Sanchez', image: 'rick.jpeg' }

describe('fetchCharacters', () => {
  it('posts a GraphQL query and returns the characters', async () => {
    const fetchSpy = mockFetchResponse({ data: { characters: { results: [rick] } } })

    const characters = await fetchCharacters()

    expect(characters).toEqual([rick])
    const [url, request] = fetchSpy.mock.calls[0]
    expect(url).toBe(RICK_AND_MORTY_API_URL)
    expect(request?.method).toBe('POST')
    const body = JSON.parse(String(request?.body))
    expect(body.query).toContain('characters')
    expect(body.variables).toEqual({ name: '' })
  })

  it('passes the search name as a variable', async () => {
    const fetchSpy = mockFetchResponse({ data: { characters: { results: [rick] } } })

    await fetchCharacters('  rick ')

    const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))
    expect(body.variables).toEqual({ name: 'rick' })
  })

  it('returns an empty list when nothing matches', async () => {
    mockFetchResponse({ data: { characters: { results: [] } } })

    await expect(fetchCharacters('zzzz')).resolves.toEqual([])
  })

  it('throws when the server responds with an HTTP error', async () => {
    mockFetchResponse({}, { ok: false, status: 500 })

    await expect(fetchCharacters()).rejects.toThrow('500')
  })

  it('throws when the API returns GraphQL errors', async () => {
    mockFetchResponse({ data: null, errors: [{ message: 'Something broke' }] })

    await expect(fetchCharacters()).rejects.toThrow('Something broke')
  })
})
