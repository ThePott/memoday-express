export const convertRgbToHexcode = (rgb: [number, number, number]) => {
    const r = rgb[0].toString(16)
    const g = rgb[1].toString(16)
    const b = rgb[2].toString(16)
    return `#${r}${g}${b}`
}
