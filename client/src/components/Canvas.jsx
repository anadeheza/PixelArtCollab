import { useEffect, useRef, useCallback } from 'react'

const CELL_SIZE = 16  // px por celda en pantalla
const GRID_COLS = 60
const GRID_ROWS = 32

export default function Canvas({pixels, selectedColor, tool, updatePixel, emitPixel, emitFill }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const toolRef = useRef(tool)

  useEffect(() => {
    toolRef.current = tool      
  }, [tool])

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

  const drawAt = (e) => {
    const cell = getCellFromEvent(e)
    if (!cell) return

    if (toolRef.current === 'fill') return  

    const color = toolRef.current === 'erase' ? '#ffffff' : selectedColor
    updatePixel(cell.x, cell.y, color)
    emitPixel(cell.x, cell.y, color)
  }

  const handleMouseDown = (e) => {
    console.log('tool is:', toolRef.current)
    isDrawing.current = true

    if (toolRef.current === 'fill') {
      const filled = {}
      for (let x = 0; x < GRID_COLS; x++) {
        for (let y = 0; y < GRID_ROWS; y++) {
          filled[`${x},${y}`] = selectedColor
        }
      }
      Object.entries(filled).forEach(([key, color]) => {
        const [x, y] = key.split(',').map(Number)
        updatePixel(x, y, color)
      })
      emitFill(selectedColor)
      isDrawing.current = false
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