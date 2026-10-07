import { useCallback, useEffect, useRef, useState } from 'react'

export interface PanZoomTransform {
  x: number
  y: number
  scale: number
}

const MIN_SCALE = 0.15
const MAX_SCALE = 2.5

export function usePanZoom(contentW: number, contentH: number) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [transform, setTransform] = useState<PanZoomTransform>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  const fitToScreen = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const scale = Math.min(rect.width / contentW, rect.height / contentH) * 0.94
    setTransform({
      scale,
      x: (rect.width - contentW * scale) / 2,
      y: (rect.height - contentH * scale) / 2,
    })
  }, [contentW, contentH])

  const zoomBy = useCallback((factor: number, center?: { x: number; y: number }) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = center?.x ?? rect.width / 2
    const cy = center?.y ?? rect.height / 2
    setTransform((prev) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor))
      const wx = (cx - prev.x) / prev.scale
      const wy = (cy - prev.y) / prev.scale
      return { scale: newScale, x: cx - wx * newScale, y: cy - wy * newScale }
    })
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      setIsDragging(true)
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
      dragStart.current = { x: e.clientX, y: e.clientY, px: transform.x, py: transform.y }
    },
    [transform.x, transform.y]
  )

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragStart.current
    if (!ds) return
    setTransform((prev) => ({ ...prev, x: ds.px + (e.clientX - ds.x), y: ds.py + (e.clientY - ds.y) }))
  }, [])

  const onPointerUp = useCallback(() => {
    setIsDragging(false)
    dragStart.current = null
  }, [])

  // Attach wheel natively (not via React's onWheel) so preventDefault reliably
  // stops the page from scrolling while the cursor is over the map.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const factor = Math.exp(-e.deltaY * 0.0012)
      zoomBy(factor, { x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [zoomBy])

  return {
    wrapRef,
    transform,
    isDragging,
    fitToScreen,
    zoomBy,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
