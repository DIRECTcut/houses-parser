import Houses from './HousesInterface'

export default class HousesParser {
  //предполагается, что диапазон задан включительно

  private readonly source: string

  constructor(query: string) {
    this.source = query
  }

  public isHouseIncluded(houseNumber: string): Boolean {
    const houses = this.getRangesFromString(this.source)
    const isHouseInRange = this.isHouseInRange.bind(this)

    if (houses?.houses?.includes(houseNumber)) return true

    if (
      houses?.ranges?.fullRange &&
      isHouseInRange(+houseNumber, houses.ranges.fullRange, 'full')
    )
      return true

    if (
      houses?.ranges?.evenRange &&
      isHouseInRange(+houseNumber, houses.ranges.evenRange, 'even')
    )
      return true

    if (
      houses?.ranges?.oddRange &&
      isHouseInRange(+houseNumber, houses.ranges.oddRange, 'odd')
    )
      return true

    return false
  }

  private isOddNum(num: number) {
    if (num) {
      return !!(num % 2)
    } else return NaN
  }
  private isEvenNum(num: number) {
    if (num) {
      return !(num % 2)
    } else return NaN
  }

  private isHouseInRange(
    houseNum: number,
    range: [number, number],
    type: 'odd' | 'even' | 'full',
  ): Boolean {
    if (houseNum >= range[0] && houseNum <= range[1]) {
      if (type == 'full') return true
      else if (type == 'odd' && this.isOddNum(houseNum)) return true
      else if (type == 'even' && this.isEvenNum(houseNum)) return true
    }
    return false
  }

  private getRangesFromString(source: string): Houses | null {
    const r1 = /четные *(?<evenRange>\d+[\+|\-]\d*)[^\w]*нечетные *(?<oddRange>\d+[\+|\-]\d+)/
    const r2 = /нечетные *(?<oddRange>\d+[\+\-]\d*)[^\w]*четные *(?<evenRange>\d+[\+\-]\d*)/
    const r3 = /^четные *с *(?<evenRange>\d*) *и *вся *улица *до *конца$/
    const r4 = /^нечетные *с *(?<oddRange>\d*) *и *вся *улица *до *конца$/

    const result: Houses = {}

    if (source.match(r1) || source.match(r2)) {
      const matchResult = source.match(r1) || source.match(r2)

      let evenRange: string | undefined = matchResult?.groups?.evenRange
      let oddRange: string | undefined = matchResult?.groups?.oddRange

      if (evenRange) {
        result.ranges = result.ranges || {}
        result.ranges.evenRange = this.getBorderNumsFromRange(evenRange)
      }
      if (oddRange) {
        result.ranges = result.ranges || {}
        result.ranges.oddRange = this.getBorderNumsFromRange(oddRange)
      }

      return result
    } else if (source.match(r3) || source.match(r4)) {
      const matchResult: RegExpMatchArray | null =
        source.match(r3) || source.match(r4)

      let evenRange: string | undefined = matchResult?.groups?.evenRange
      let oddRange: string | undefined = matchResult?.groups?.oddRange

      if (evenRange) {
        result.ranges = result.ranges || {}
        result.ranges.evenRange = this.getBorderNumsFromRange(evenRange + '+')
      }
      if (oddRange) {
        result.ranges = result.ranges || {}
        result.ranges.oddRange = this.getBorderNumsFromRange(oddRange + '+')
      }
      return result
    } else {
      return this.getHousesFromEnumeratingString(source)
    }
  }

  private getHousesFromEnumeratingString(source: string): Houses {
    const result: Houses = {}
    const houses = source.split(', ')

    houses.forEach((i) => {
      if (this.isRange(i)) {
        result.ranges = result.ranges || {}
        result.ranges.fullRange = this.getBorderNumsFromRange(i)
      } else {
        result.houses = result.houses || []
        result.houses.push(i)
      }
    })
    return result
  }

  private isRange(source: string | number): Boolean {
    if (typeof source === 'number') {
      source = source.toString()
    }
    return (source as string).includes('-')
  }

  private getBorderNumsFromRange(range: string): [number, number] {
    const r = /(?<from>[0-9]+)(?<separator>[\-\+])(?<to>[0-9]+)*/
    const matchResult = range.match(r)

    if (matchResult?.groups?.separator == '-') {
      const from = matchResult.groups.from
      const to = matchResult.groups.to

      return [+from, +to]
    } else if (matchResult?.groups?.separator == '+') {
      const from = matchResult.groups.from
      const to = Infinity

      return [+from, Infinity]
    } else {
      throw new Error(`Unable to determine border numbers for range: ${range}`)
    }
  }
}
