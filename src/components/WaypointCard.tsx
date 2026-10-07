import { PHASES, type FlowNode } from '../data/flowchart'
import { KindIcon } from './icons'

interface WaypointCardProps {
  node: FlowNode
  onGo: (id: number) => void
  onRestart: () => void
  onShowMap: () => void
}

export function WaypointCard({ node, onGo, onRestart, onShowMap }: WaypointCardProps) {
  const isEnd = node.kind === 'end'
  const kindLabel = node.kind === 'decision' ? 'Decision' : isEnd ? 'Summit' : 'Action'

  return (
    <div
      className={'card' + (isEnd ? ' end' : '')}
      style={{ '--phase-color': PHASES[node.phase].color } as React.CSSProperties}
    >
      <div className="chip">
        <KindIcon kind={node.kind} />
        <span>
          {PHASES[node.phase].name} · {kindLabel}
        </span>
      </div>
      <h2>{node.title}</h2>
      <p className="detail">{node.detail}</p>
      <div className="actions">
        {node.kind === 'decision' && (
          <>
            <button className="btn primary" onClick={() => onGo(node.yes as number)}>
              {node.yesLabel}
            </button>
            <button className="btn" onClick={() => onGo(node.no as number)}>
              {node.noLabel}
            </button>
          </>
        )}
        {node.kind === 'action' && (
          <button className="btn primary" onClick={() => onGo(node.next as number)}>
            {node.btn}
          </button>
        )}
        {isEnd && (
          <>
            <button className="btn primary" onClick={onRestart}>
              Start over
            </button>
            <button className="btn ghost" onClick={onShowMap}>
              Review the map
            </button>
          </>
        )}
      </div>
    </div>
  )
}
