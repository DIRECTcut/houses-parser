export default interface Houses {
  ranges?: {
    fullRange?: [number, number]
    oddRange?: [number, number]
    evenRange?: [number, number]
  }
  houses?: Array<number | string>
}
