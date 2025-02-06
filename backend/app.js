import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGION,
    Credential: true
}))

// app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())
export { app }

//routes
import userRouter from "./src/routes/user.routes.js";
import testRouter from "./src/routes/test.routes.js";
import adminRouter from "./src/routes/admin.routes.js";

app.use("/api/v1/admin", adminRouter)

app.use("/api/v1/tests", testRouter)

app.use("/api/v1/users", userRouter)
app.use("/" , (req, res) => {
    res.send("Welcome to the backend")
})