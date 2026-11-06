import { toast } from 'sonner'
import { SpeechToast } from './components/SpeechToast'

// Character headshots come straight from the Rick and Morty API.
const MEESEEKS_IMAGE = 'https://rickandmortyapi.com/api/character/avatar/242.jpeg'
const POOPYBUTTHOLE_IMAGE = 'https://rickandmortyapi.com/api/character/avatar/244.jpeg'

export function showItemCreatedToast(title: string) {
  toast.custom(() => (
    <SpeechToast
      tone="meeseeks"
      imageUrl={MEESEEKS_IMAGE}
      imageAlt="Mr. Meeseeks"
      headline="Caaan do!"
      detail={`Added "${title}"`}
    />
  ))
}

export function showItemDoneToast(title: string) {
  toast.custom(() => (
    <SpeechToast
      tone="poopybutthole"
      imageUrl={POOPYBUTTHOLE_IMAGE}
      imageAlt="Mr. Poopybutthole"
      headline="Ooo-wee!"
      detail={`"${title}" is done`}
    />
  ))
}
