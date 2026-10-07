import { PHASES } from '../data/flowchart'

export function PhaseRail({ currentPhase }: { currentPhase: number }) {
  return (
    <div className="rail">
      <p className="rail-title">Phases</p>
      <ol>
        {PHASES.map((phase, i) => {
          const cls = i < currentPhase ? 'done' : i === currentPhase ? 'current' : ''
          return (
            <li
              key={phase.name}
              className={cls}
              style={{
                '--phase-color': phase.color,
                marginLeft: i * 10,
              } as React.CSSProperties}
            >
              {phase.name}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
