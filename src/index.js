import express from "express";
import dotenv from "dotenv";
import { app } from "./app.js"; 
import { Server } from "socket.io";
import http from "http";
import connectDB from "./db/index.js";

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
});

app.set("io", io); 

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