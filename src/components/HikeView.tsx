import { NODES, PHASES } from '../data/flowchart'
import { BackIcon, RestartIcon } from './icons'
import { PhaseRail } from './PhaseRail'
import { WaypointCard } from './WaypointCard'

interface HikeViewProps {
  history: number[]
  onGo: (id: number) => void
  onBack: () => void
  onRestart: () => void
  onShowMap: () => void
}

export function HikeView({ history, onGo, onBack, onRestart, onShowMap }: HikeViewProps) {
  const currentId = history[history.length - 1]
  const node = NODES[currentId]

  return (
    <div className="hike-view">
      <PhaseRail currentPhase={node.phase} />
      <div className="stage">
        <WaypointCard node={node} onGo={onGo} onRestart={onRestart} onShowMap={onShowMap} />
        <div className="stage-footer">
          <div className="foot-controls">
            <button className="iconbtn" onClick={onBack} disabled={history.length <= 1}>
              <BackIcon />
              Back
            </button>
            <button className="iconbtn" onClick={onRestart}>
              <RestartIcon />
              Start over
            </button>
          </div>
          <span className="progress-note">
            Phase {node.phase + 1} of 7 · {PHASES[node.phase].name}
          </span>
        </div>
      </div>
    </div>
  )
}
