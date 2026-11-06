import { Toaster } from 'sonner'
import { BoardScreen } from './components/BoardScreen'
import { PortalLoader } from './components/PortalLoader'
import { useCharacters } from './hooks/useCharacters'

export default function App() {
  const { state, retry } = useCharacters()

  return (
    <>
      {state.status === 'loading' && <PortalLoader status="loading" />}
      {state.status === 'error' && (
        <PortalLoader status="error" message={state.message} onRetry={retry} />
      )}
      {state.status === 'ready' && <BoardScreen characters={state.characters} />}
      <Toaster position="bottom-right" duration={3500} visibleToasts={4} />
    </>
  )
}
