import { PHASES } from '../data/flowchart'

export function Legend() {
  return (
    <div className="legend">
      <b>Phases</b>
      {PHASES.map((phase) => (
        <span className="row" key={phase.name}>
          <span className="dot" style={{ background: phase.color }} />
          {phase.name}
        </span>
      ))}
    </div>
  )
}
