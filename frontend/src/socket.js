import { io } from 'socket.io-client'

export const socket = io("http://localhost:8003", {
  withCredentials:true
})

