import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
})

let canvasState = {}

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id)

  socket.emit('canvas:init', canvasState)
  io.emit('users:count', io.engine.clientsCount)

  socket.on('pixel:draw', ({ x, y, color }) => {
    canvasState[`${x},${y}`] = color
    socket.broadcast.emit('pixel:draw', { x, y, color })
  })

  socket.on('disconnect', () => {
    io.emit('users:count', io.engine.clientsCount)
    console.log('Usuario desconectado:', socket.id)
  })
})

httpServer.listen(3001, () => console.log('Servidor en http://localhost:3001'))