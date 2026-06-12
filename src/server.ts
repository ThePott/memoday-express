import express from "express"
import debugRouter from "./features/debug/router/debug-router.js"
import imageRouter from "./features/image/router/image-router.js"

const app = express()
app.use("/debug", debugRouter)
app.use("/image", imageRouter)

app.listen(3000, () => console.log("server is on port 3000"))
