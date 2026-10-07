import { useCallback, useState } from 'react'
import './App.css'
import { HikeView } from './components/HikeView'
import { MapView } from './components/MapView'
import { Notes } from './components/Notes'
import { START_ID } from './data/flowchart'

type View = 'hike' | 'map'

function App() {
  const [history, setHistory] = useState<number[]>([START_ID])
  const [view, setView] = useState<View>('hike')

  const go = useCallback((id: number) => {
    setHistory((h) => [...h, id])
  }, [])

  const back = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h))
  }, [])

  const restart = useCallback(() => {
    setHistory([START_ID])
  }, [])

  const jump = useCallback((id: number) => {
    setHistory((h) => [...h, id])
    setView('hike')
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>The Money Trail</h1>
          <p>An interactive walk through r/personalfinance's income flowchart.</p>
        </div>
        <div className="view-toggle" role="tablist">
          <button
            className={view === 'hike' ? 'active' : ''}
            role="tab"
            aria-selected={view === 'hike'}
            onClick={() => setView('hike')}
          >
            Step through
          </button>
          <button
            className={view === 'map' ? 'active' : ''}
            role="tab"
            aria-selected={view === 'map'}
            onClick={() => setView('map')}
          >
            Overview map
          </button>
        </div>
      </header>

      <main className="app-main">
        {view === 'hike' && (
          <HikeView history={history} onGo={go} onBack={back} onRestart={restart} onShowMap={() => setView('map')} />
        )}
        <MapView active={view === 'map'} history={history} onJump={jump} />
      </main>

      <Notes />
    </div>
  )
}

export default App
