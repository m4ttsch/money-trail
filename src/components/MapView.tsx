import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { CANVAS_H, CANVAS_W, EDGES, NODES, type FlowNode } from '../data/flowchart'
import { usePanZoom } from '../hooks/usePanZoom'
import { edgeMidpoint, isLoopBack, pathFor } from '../lib/graphLayout'
import { Legend } from './Legend'
import { NodeChip } from './NodeChip'

interface MapViewProps {
  active: boolean
  history: number[]
  onJump: (id: number) => void
}

interface TooltipState {
  node: FlowNode
  x: number
  y: number
}

const plottedEdges = EDGES.map((e) => {
  const a = NODES[e.from]
  const b = NODES[e.to]
  return {
    ...e,
    d: pathFor(a, b),
    mid: edgeMidpoint(a, b),
    isLoop: isLoopBack(a, b),
  }
})

export function MapView({ active, history, onJump }: MapViewProps) {
  const { wrapRef, transform, isDragging, fitToScreen, zoomBy, onPointerDown, onPointerMove, onPointerUp } =
    usePanZoom(CANVAS_W, CANVAS_H)
  const hasFitted = useRef(false)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    if (active && !hasFitted.current) {
      hasFitted.current = true
      requestAnimationFrame(fitToScreen)
    }
  }, [active, fitToScreen])

  useEffect(() => {
    function onResize() {
      if (active) fitToScreen()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active, fitToScreen])

  const visited = useMemo(() => new Set(history), [history])
  const currentId = history[history.length - 1]
  const visitedPairs = useMemo(() => {
    const s = new Set<string>()
    for (let i = 0; i < history.length - 1; i++) s.add(`${history[i]}>${history[i + 1]}`)
    return s
  }, [history])

  const transformStyle = {
    transform: `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})`,
  }

  function handleHover(node: FlowNode, e: ReactPointerEvent) {
    setTooltip({ node, x: e.clientX, y: e.clientY })
  }
  function handleMove(e: ReactPointerEvent) {
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev))
  }

  const contours = useMemo(() => {
    const items: string[] = []
    for (let i = 0; i < 6; i++) {
      const yy = 40 + i * 110
      items.push(
        `M0,${yy} C ${CANVAS_W * 0.25},${yy - 30} ${CANVAS_W * 0.5},${yy + 30} ${CANVAS_W},${yy}`
      )
    }
    return items
  }, [])

  return (
    <div className="map-view" style={{ display: active ? 'flex' : 'none' }}>
      <div
        className={'map-canvas-wrap' + (isDragging ? ' grabbing' : '')}
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg width={CANVAS_W} height={CANVAS_H} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} style={transformStyle}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-soft)" />
            </marker>
            <marker id="arrowActive" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)" />
            </marker>
          </defs>
          <g>
            {contours.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth={1} opacity={0.35} />
            ))}
          </g>
          <g>
            {plottedEdges.map((e, idx) => {
              const isActive = visitedPairs.has(`${e.from}>${e.to}`)
              return (
                <path
                  key={idx}
                  d={e.d}
                  fill="none"
                  stroke={isActive ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={isActive ? 3 : 2}
                  strokeDasharray={e.isLoop ? '5 5' : undefined}
                  markerEnd={isActive ? 'url(#arrowActive)' : 'url(#arrow)'}
                  style={{ opacity: isActive ? 1 : 0.7 }}
                />
              )
            })}
            {plottedEdges.map((e, idx) =>
              e.label ? (
                <g key={idx} transform={`translate(${e.mid.x},${e.mid.y})`}>
                  <rect x={-16} y={-9} width={32} height={16} fill="var(--bg)" opacity={0.9} />
                  <text x={0} y={3} textAnchor="middle" fontFamily="var(--mono)" fontSize={9} fill="var(--text-soft)">
                    {e.label}
                  </text>
                </g>
              ) : null
            )}
          </g>
        </svg>
        <div className="chip-layer" style={{ width: CANVAS_W, height: CANVAS_H, ...transformStyle }}>
          {Object.values(NODES).map((node) => (
            <NodeChip
              key={node.id}
              node={node}
              visited={visited.has(node.id)}
              current={node.id === currentId}
              onSelect={onJump}
              onHover={handleHover}
              onMove={handleMove}
              onLeave={() => setTooltip(null)}
            />
          ))}
        </div>
      </div>
      <div className="map-hint">Drag to pan · scroll to zoom · click a waypoint to jump in</div>
      <div className="map-controls">
        <button title="Zoom in" onClick={() => zoomBy(1.25)}>
          +
        </button>
        <button title="Zoom out" onClick={() => zoomBy(0.8)}>
          −
        </button>
        <button title="Fit to screen" onClick={fitToScreen}>
          ⤢
        </button>
      </div>
      <Legend />
      {tooltip && (
        <div className="tooltip show" style={{ left: tooltip.x + 16, top: tooltip.y + 16 }}>
          <b>{tooltip.node.title}</b>
          {tooltip.node.detail}
        </div>
      )}
    </div>
  )
}
