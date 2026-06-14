export const makeSerializable = (obj: unknown): unknown => {
    if (obj instanceof Promise) throw new Error("You must await promise")

    if (typeof obj === "bigint") return obj.toString()

    if (Array.isArray(obj)) {
        return obj.map((el) => makeSerializable(el))
    }

    const isNormalObject = obj !== null && typeof obj === "object" && !(obj instanceof Date)
    if (isNormalObject) {
        const entryArray = Object.entries(obj)
        const newEntryArray = entryArray.map(([key, value]) => [key, makeSerializable(value)])
        const newObj = Object.fromEntries(newEntryArray)
        return newObj
    }

    return obj
}
