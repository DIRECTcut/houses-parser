import HousesParser from './HousesParser'

const house = '18'
const range = 'четные 2-28, нечетные 1-21'

const result = new HousesParser(range).isHouseIncluded(house) ? 'входит' : 'не входит'

console.log(`Дом ${house} ${result} в диапазон '${range}'`)