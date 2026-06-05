import dotenv from "dotenv";
import { app } from "./app.js"; 
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import connectDB from "./db/index.js";

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
        return next(new Error("Authentication required"));
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        return next(new Error("Invalid token"));
    }
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.user._id} (${socket.user.role})`);
    socket.join(socket.user.role);
    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.user._id}`);
    });
});

connectDB()
.then (()=>{
    server.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    }); 
    server.on("error", (err) => {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    });
})
.catch((error) => {
    console.log("Error connecting to MongoDB:", error);
})

//after completing the operation close the db 
//ensure connection pulling on the time of operations only 