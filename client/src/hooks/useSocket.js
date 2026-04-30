import { useEffect, useRef } from 'react'
import * as SocketIO from 'socket.io-client'
const io = SocketIO.io ?? SocketIO.default

export function useSocket(onPixelDraw, onCanvasInit, setUsers) {
  const socketRef = useRef(null)

  useEffect(() => {
    if(socketRef.current) return

    socketRef.current = io('https://pixelartcollab.onrender.com', {
      transports: ['websocket', 'polling'],
    })
 
    socketRef.current.on('canvas:init', onCanvasInit)
    socketRef.current.on('pixel:draw', onPixelDraw)
    socketRef.current.on('users:count', (count) => setUsers(count))
    socketRef.current.on('canvas:fill', (filledPixels) => {
      Object.entries(filledPixels).forEach(([key, color]) => {
        const [x, y] = key.split(',').map(Number)
        onPixelDraw({ x, y, color })
      })
    })

    return () => {
        socketRef.current?.disconnect()
        socketRef.current = null
    }
  }, [])

  const emitPixel = (x, y, color) => {
    socketRef.current?.emit('pixel:draw', { x, y, color })
  }

   const emitFill = (filledPixels) => {
    socketRef.current?.emit('canvas:fill', filledPixels)
  }

  return { emitPixel, emitFill, socket: socketRef }
}