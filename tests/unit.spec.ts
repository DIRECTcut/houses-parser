import HousesParser from '../src/HousesParser'
import { describe } from 'mocha'
import { expect } from 'chai'
import Houses from '../src/HousesInterface'

const sampleParser = new HousesParser('четные 2-28, нечетные 1-21')

describe('HousesParser', () => {
  describe('private getRangesFromString()', () => {
    const getRangesFromString = sampleParser['getRangesFromString'].bind(
      sampleParser,
    )

    it('should return odd and even ranges', () => {
      const result: Houses = {
        ranges: {
          oddRange: [1, 21],
          evenRange: [2, 28],
        },
      }

      expect(getRangesFromString('четные 2-28, нечетные 1-21')).to.eql(result)
      expect(getRangesFromString('четные 2-28; нечетные 1-21')).to.eql(result)
      expect(getRangesFromString('четные 2-28 нечетные 1-21')).to.eql(result)
      expect(getRangesFromString('четные2-28нечетные1-21')).to.eql(result)
    })

    it('should return infinite ranges', () => {
      const result: Houses = {
        ranges: {
          oddRange: [11, Infinity],
          evenRange: [42, Infinity],
        },
      }

      expect(getRangesFromString('нечетные 11+, четные 42+')).to.eql(result)
      expect(getRangesFromString('нечетные 11+; четные 42+')).to.eql(result)
      expect(getRangesFromString('нечетные 11+ четные 42+')).to.eql(result)
      expect(getRangesFromString('нечетные 11+четные 42+')).to.eql(result)
    })

    it('should return infinite ranges (и вся улица до конца)', () => {
      const oddResult: Houses = {
        ranges: {
          oddRange: [20, Infinity],
        },
      }

      const evenResult: Houses = {
        ranges: {
          evenRange: [100, Infinity],
        },
      }

      expect(getRangesFromString('нечетные с 20 и вся улица до конца')).to.eql(
        oddResult,
      )
      expect(getRangesFromString('четные с 100 и вся улица до конца')).to.eql(
        evenResult,
      )
    })

    it('should return houses from string', () => {
      const result: Houses = {
        houses: ['7/1', '11', '17', '17/1', '17/2', '8/2', '15', '15/1', '15а'],
      }

      expect(
        getRangesFromString('7/1, 11, 17, 17/1, 17/2, 8/2, 15, 15/1, 15а'),
      ).to.eql(result)
    })

    it('should return houses and ranges from string', () => {
      const result: Houses = {
        ranges: {
          fullRange: [100, 106],
        },
        houses: ['12', '22', '36', '42', '45'],
      }

      expect(getRangesFromString('12, 22, 36, 42, 45, 100-106')).to.eql(result)
    })
  })

  describe('private isRange()', () => {
    it('should determine if passed string is a range', () => {
      const isRange = sampleParser['isRange'].bind(sampleParser)

      expect(isRange('100-106')).to.eql(true)
      expect(isRange('15a')).to.eql(false)
      expect(isRange(14)).to.eql(false)
    })
  })

  describe('private getBorderNumsFromRange()', () => {
    const getBorderNumsFromRange = sampleParser['getBorderNumsFromRange']

    it('should return borders of a range', () => {
      expect(getBorderNumsFromRange('1-20')).to.eql([1, 20])
      expect(getBorderNumsFromRange('0-100')).to.eql([0, 100])
      expect(getBorderNumsFromRange('30-30')).to.eql([30, 30])
      expect(getBorderNumsFromRange('20-50')).to.eql([20, 50])
      expect(getBorderNumsFromRange('30+')).to.eql([30, Infinity])
    })

    it('should throw error if invalid range passed', () => {
      expect(() => getBorderNumsFromRange('q-w')).to.throw
    })
  })

  describe('public isHouseIncluded()', () => {
    it('should determine if house is in range', () => {
      const parser1 = new HousesParser('четные 2-28, нечетные 1-21')

      expect(parser1.isHouseIncluded('5')).to.be.true
      expect(parser1.isHouseIncluded('4')).to.be.true
      expect(parser1.isHouseIncluded('23')).to.be.false
      expect(parser1.isHouseIncluded('30')).to.be.false

      const parser2 = new HousesParser('четные с 20 и вся улица до конца')

      expect(parser2.isHouseIncluded('30')).to.be.true
      expect(parser2.isHouseIncluded('15')).to.be.false
      expect(parser2.isHouseIncluded('16')).to.be.false
      expect(parser2.isHouseIncluded('21')).to.be.false

      const parser3 = new HousesParser(
        '7/1, 11, 17, 17/1, 17/2, 8/2, 15, 15/1, 15а',
      )

      expect(parser3.isHouseIncluded('7/1')).to.be.true
      expect(parser3.isHouseIncluded('7/2')).to.be.false
      expect(parser3.isHouseIncluded('15а')).to.be.true
      expect(parser3.isHouseIncluded('15б')).to.be.false

      const parser4 = new HousesParser('12, 22, 36, 42, 45, 100-106')

      expect(parser4.isHouseIncluded('12')).to.be.true
      expect(parser4.isHouseIncluded('13')).to.be.false
      expect(parser4.isHouseIncluded('105')).to.be.true
      expect(parser4.isHouseIncluded('107')).to.be.false
      expect(parser4.isHouseIncluded('15a')).to.be.false
    })
  })
})
