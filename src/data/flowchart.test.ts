import { describe, expect, it } from 'vitest'
import { NODES, START_ID, xFor } from './flowchart'

const ids = Object.keys(NODES).map(Number)

describe('flowchart graph integrity', () => {
  it('every yes/no/next reference points at a real node', () => {
    for (const id of ids) {
      const n = NODES[id]
      for (const key of ['next', 'yes', 'no'] as const) {
        const target = n[key]
        if (target !== undefined) {
          expect(NODES[target], `${id}.${key} -> ${target}`).toBeDefined()
        }
      }
    }
  })

  it('decisions have both branches, actions have a next step, end has neither', () => {
    for (const id of ids) {
      const n = NODES[id]
      if (n.kind === 'decision') {
        expect(n.yes, `node ${id} missing yes`).toBeDefined()
        expect(n.no, `node ${id} missing no`).toBeDefined()
      }
      if (n.kind === 'action') {
        expect(n.next, `node ${id} missing next`).toBeDefined()
      }
    }
  })

  it('every node is reachable from the start, and the end is reachable', () => {
    const seen = new Set<number>()
    const stack = [START_ID]
    while (stack.length) {
      const id = stack.pop() as number
      if (seen.has(id)) continue
      seen.add(id)
      const n = NODES[id]
      for (const target of [n.next, n.yes, n.no]) {
        if (target !== undefined && !seen.has(target)) stack.push(target)
      }
    }
    expect(seen.size).toBe(ids.length)
  })

  it('forward edges point right or down; only intentional loops point left', () => {
    // A "loop" is any edge whose target id is numerically earlier — those are
    // meant to curve back (dashed) in the overview map. Every other edge must
    // move the same direction or right on the x axis, or the map renderer
    // will draw a forward-looking "Yes"/"No" edge as if it were a loop.
    for (const id of ids) {
      const n = NODES[id]
      const edges: [string, number | undefined][] = [
        ['yes', n.yes],
        ['no', n.no],
        ['next', n.next],
      ]
      for (const [key, to] of edges) {
        if (to === undefined) continue
        const isLoop = to < id
        const dx = xFor(NODES[to].col) - xFor(n.col)
        if (!isLoop) {
          expect(dx, `${id}.${key} -> ${to} should move forward (dx=${dx})`).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })
})
