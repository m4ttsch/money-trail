import { NODE_H, NODE_W } from '../data/flowchart'

export interface PlottedNode {
  x: number
  y: number
  lane: number
}

interface Point {
  x: number
  y: number
}

const HALF_W = NODE_W / 2
const HALF_H = NODE_H / 2

type AnchorMode = 'h' | 'loop' | 'up' | 'down'

function anchorPoints(a: PlottedNode, b: PlottedNode): [Point, Point, AnchorMode] {
  if (b.x >= a.x && b.lane === a.lane) {
    return [{ x: a.x + HALF_W, y: a.y }, { x: b.x - HALF_W, y: b.y }, 'h']
  }
  if (b.x < a.x) {
    // Intentional loop-back (e.g. "keep paying down debt, then recheck").
    return [{ x: a.x, y: a.y + HALF_H }, { x: b.x, y: b.y + HALF_H }, 'loop']
  }
  if (b.y < a.y) {
    return [{ x: a.x, y: a.y - HALF_H }, { x: b.x, y: b.y + HALF_H }, 'up']
  }
  if (b.y > a.y) {
    return [{ x: a.x, y: a.y + HALF_H }, { x: b.x, y: b.y - HALF_H }, 'down']
  }
  return [{ x: a.x + HALF_W, y: a.y }, { x: b.x - HALF_W, y: b.y }, 'h']
}

export function edgeMidpoint(a: PlottedNode, b: PlottedNode): Point {
  const [p1, p2] = anchorPoints(a, b)
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
}

export function isLoopBack(a: PlottedNode, b: PlottedNode): boolean {
  return b.x < a.x
}

export function pathFor(a: PlottedNode, b: PlottedNode): string {
  const [p1, p2, mode] = anchorPoints(a, b)
  if (mode === 'h') {
    const dx = Math.max((p2.x - p1.x) * 0.5, 30)
    return `M ${p1.x},${p1.y} C ${p1.x + dx},${p1.y} ${p2.x - dx},${p2.y} ${p2.x},${p2.y}`
  }
  if (mode === 'loop') {
    const dy = 70
    return `M ${p1.x},${p1.y} C ${p1.x},${p1.y + dy} ${p2.x},${p2.y + dy} ${p2.x},${p2.y}`
  }
  const dy2 = (p2.y - p1.y) * 0.5
  return `M ${p1.x},${p1.y} C ${p1.x},${p1.y + dy2} ${p2.x},${p2.y - dy2} ${p2.x},${p2.y}`
}
