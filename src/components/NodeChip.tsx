import type { PointerEvent as ReactPointerEvent } from 'react'
import { PHASES, type FlowNode } from '../data/flowchart'
import { KindIcon } from './icons'

interface NodeChipProps {
  node: FlowNode
  visited: boolean
  current: boolean
  onSelect: (id: number) => void
  onHover: (node: FlowNode, e: ReactPointerEvent) => void
  onMove: (e: ReactPointerEvent) => void
  onLeave: () => void
}

export function NodeChip({ node, visited, current, onSelect, onHover, onMove, onLeave }: NodeChipProps) {
  const kindLabel = node.kind === 'decision' ? 'Decision' : node.kind === 'end' ? 'Summit' : 'Action'
  let cls = 'node-chip'
  if (node.kind === 'end') cls += ' end'
  if (visited && !current) cls += ' visited'
  if (current) cls += ' current'

  return (
    <div
      className={cls}
      style={{ left: node.x, top: node.y, '--phase-color': PHASES[node.phase].color } as React.CSSProperties}
      onPointerEnter={(e) => onHover(node, e)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={() => onSelect(node.id)}
    >
      <span className="k">
        <KindIcon kind={node.kind} />
        {kindLabel}
      </span>
      <span>{node.title}</span>
    </div>
  )
}
