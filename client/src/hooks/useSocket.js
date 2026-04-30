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
    socketRef.current.on('canvas:fill', (color) => {
      for (let x = 0; x < 60; x++) {
        for (let y = 0; y < 32; i++) {
          onPixelDraw({x, y, color})
        }
      }
    })
    socketRef.current.on('canvas:clear', () => {
      onCanvasInit({}) 
    })

    return () => {
        socketRef.current?.disconnect()
        socketRef.current = null
    }
  }, [])

  const emitPixel = (x, y, color) => {
    socketRef.current?.emit('pixel:draw', { x, y, color })
  }

   const emitFill = (color) => {
    socketRef.current?.emit('canvas:fill', color)
  }


  return { emitPixel, emitFill, socket: socketRef }
}