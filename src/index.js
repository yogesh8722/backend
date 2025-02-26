import dotenv from 'dotenv'
dotenv.config();


import connectDB from "./db/db.js";
import config from './config/config.js';
import app from './app.js';

const port=config.PORT || 8000;

// MongoDB Connect
connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`server is running ${port}`);
    })
})
.catch((err)=>{
    console.log("Mongodb Connection Error",err);
})
