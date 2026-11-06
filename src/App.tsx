import { Toaster } from 'sonner'
import { BoardScreen } from './components/BoardScreen'
import { PortalLoader } from './components/PortalLoader'
import { SpaceBackground } from './components/SpaceBackground'
import { useCharacters } from './hooks/useCharacters'

export default function App() {
  const { state, retry } = useCharacters()

  return (
    <>
      <SpaceBackground />
      {state.status === 'loading' && <PortalLoader status="loading" />}
      {state.status === 'error' && (
        <PortalLoader status="error" message={state.message} onRetry={retry} />
      )}
      {state.status === 'ready' && <BoardScreen characters={state.characters} />}
      {/* expand lists toasts one above another. The default collapsed pile shows the older
          ones peeking out, since our speech bubbles don't fill the whole toast. */}
      <Toaster
        position="bottom-right"
        duration={3500}
        visibleToasts={4}
        gap={10}
        expand
      />
    </>
  )
}
