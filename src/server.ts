import express from "express"
import debugRouter from "./features/debug/router/debug-router.js"
import memoryRouter from "./features/memory/memory-router.js"

const app = express()
app.use(express.json())
app.use(express.text())
app.use("/debug", debugRouter)
app.use("/memory", memoryRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`server is on port ${PORT}`))
