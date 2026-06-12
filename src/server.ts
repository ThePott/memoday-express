import express from "express"
import debugRouter from "./features/debug/router/debug-router.js"
import imageRouter from "./features/image/router/image-router.js"

const app = express()
app.use("/debug", debugRouter)
app.use("/image", imageRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`server is on port ${PORT}`))
