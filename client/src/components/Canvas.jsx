import { useEffect, useRef, useCallback } from 'react'
import { useSocket } from '../hooks/useSocket'

const CELL_SIZE = 16  // px por celda en pantalla
const GRID_COLS = 60
const GRID_ROWS = 32

export default function Canvas({pixels, selectedColor, tool, updatePixel, setUsers, emitPixel }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)

  // --- Socket ---
  const handleRemotePixel = useCallback(({ x, y, color }) => {
    updatePixel(x, y, color)
  }, [updatePixel])

  const handleCanvasInit = useCallback((state) => {
    Object.entries(state).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number)
      updatePixel(x, y, color)
    })
  }, [updatePixel])

  const { emitPixel, usersCount } = useSocket(handleRemotePixel, handleCanvasInit, setUsers)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    Object.entries(pixels).forEach(([key, color]) => {
      const [x, y] = key.split(',').map(Number)
      ctx.fillStyle = color
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    })

    // Grilla
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_COLS; i++) {
        ctx.beginPath()
        ctx.moveTo(i * CELL_SIZE, 0)
        ctx.lineTo(i * CELL_SIZE, GRID_ROWS * CELL_SIZE)
        ctx.stroke()
    }
    for (let i = 0; i <= GRID_ROWS; i++) {
        ctx.beginPath()
        ctx.moveTo(0, i * CELL_SIZE)
        ctx.lineTo(GRID_COLS * CELL_SIZE, i * CELL_SIZE)
        ctx.stroke()
    }
  }, [pixels,  ])

  const getCellFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE)
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE)
    
    if (x < 0 || y < 0 || x >= GRID_COLS || y >= GRID_ROWS) return null
    return { x, y }
  }

  const floodFill = (startX, startY, fillColor, currentPixels) => {
    const key = `${startX},${startY}`
    const targetColor = currentPixels[key] || '#ffffff'
    if (targetColor === fillColor) return {}

    const filled = {}
    const queue = [[startX, startY]]
    const visited = new Set()

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()
      const ck = `${cx},${cy}`
      if (visited.has(ck)) continue
      
      if (cx < 0 || cy < 0 || cx >= GRID_COLS || cy >= GRID_ROWS) continue
      const cellColor = currentPixels[ck] || '#ffffff'
      if (cellColor !== targetColor) continue

      visited.add(ck)
      filled[ck] = fillColor

      queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
    }
    return filled
  }

  const drawAt = (e) => {
    const cell = getCellFromEvent(e)
    if (!cell) return

    if (tool === 'fill') return  

    const color = tool === 'erase' ? '#ffffff' : selectedColor
    updatePixel(cell.x, cell.y, color)
    emitPixel(cell.x, cell.y, color)
  }

  const handleMouseDown = (e) => {
    isDrawing.current = true

    if (tool === 'fill') {
      const cell = getCellFromEvent(e)
      if (!cell) return
      const filled = floodFill(cell.x, cell.y, selectedColor, pixels)
      Object.entries(filled).forEach(([key, color]) => {
        const [x, y] = key.split(',').map(Number)
        updatePixel(x, y, color)
        emitPixel(x, y, color)
      })
      return
    }

    drawAt(e)
  }

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return
    drawAt(e)
  }

  const handleMouseUp = () => { isDrawing.current = false }

  return (
    <canvas
      ref={canvasRef}
      width={ GRID_COLS * CELL_SIZE}
      height={ GRID_ROWS * CELL_SIZE}
      className="border-2 border-zinc-700 rounded-lg cursor-crosshair shadow-2xl shadow-emerald-900/20"
      style={{ imageRendering: 'pixelated' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}