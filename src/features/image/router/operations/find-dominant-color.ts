// import sharp from "sharp"
//
// export const findDominantColor = async (imageBuffer: Buffer<ArrayBufferLike>): Promise<[number, number, number]> => {
//     const onePixelBuffer = await sharp(imageBuffer).resize(1, 1, { fit: "cover" }).raw().toBuffer()
//
//     const r = onePixelBuffer[0]
//     const g = onePixelBuffer[1]
//     const b = onePixelBuffer[2]
//     if (r === undefined || g === undefined || b === undefined) throw Error("---- failed to find dominant color")
//     const rgb: [number, number, number] = [r, g, b]
//     return rgb
// }
