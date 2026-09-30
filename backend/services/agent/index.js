import dotenv from "dotenv"
dotenv.config()
import express from "express"
import connect from "./config/db.js"
import router from "./routes/agent.route.js";
import { Server } from "socket.io";
import { createServer } from 'http'


const port = process.env.PORT
const app = express()
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});



app.use(express.json())


app.use("/", router(io))

app.use((err, req, res, next) => {
    console.error("Agent Service Error:", err);

    if (err?.status && err.data) {
        return res.status(err.status).json(err.data);
    }
    return res.status(500).json({ message: `Agent error: ${err.message || err}` });
});


app.get("/", (req, res) => {
    return res.json("hello from agent")
})


io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id)
    })
})

httpServer.listen(port, () => {
    console.log(`Agent service running on port ${port}`)
})