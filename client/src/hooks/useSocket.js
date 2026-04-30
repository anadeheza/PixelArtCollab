import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket(onPixelDraw, onCanvasInit, setUsers) {
  const socketRef = useRef(null)

  useEffect(() => {
    if(socketRef.current) return

    socketRef.current = io()

    socketRef.current.on('canvas:init', onCanvasInit)
    socketRef.current.on('pixel:draw', onPixelDraw)
    socketRef.current.on('users:count', (count) => setUsers(count))

    return () => {
        socketRef.current?.disconnect()
        socketRef.current = null
    }
  }, [])

  const emitPixel = (x, y, color) => {
    socketRef.current?.emit('pixel:draw', { x, y, color })
  }

  return { emitPixel, socket: socketRef }
}