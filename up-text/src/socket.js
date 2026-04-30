import { io } from "socket.io-client"

const socket = io("https://up-text-backend.onrender.com")

export default socket