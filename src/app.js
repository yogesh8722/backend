import express from "express";
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app = express();

// configration
// agr cokkie ya jwt token etc send krne h to credentials true rakhna hota h
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

// json data alow
app.use(express.json())


// configration
// url me %20 ya + aata h to use bhi axish do
app.use(express.urlencoded({extended:true}))

// pdf ya file / folder ko store ko server me hi rakhna
app.use(express.static("public"))

// cookie browser se access and set krna
app.use(cookieParser())

export default app