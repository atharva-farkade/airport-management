import express from "express";
import dotenv from "dotenv";
import { app } from "./app.js"; 
import connectDB from "./db/index.js";

dotenv.config();
connectDB()
.then (()=>{
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    }); 
    app.on("error", (err) => {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    });
})
.catch((error) => {
    console.log("Error connecting to MongoDB:", error);
})

//after completing the operation close the db 
//ensure connection pulling on the time of operations only 