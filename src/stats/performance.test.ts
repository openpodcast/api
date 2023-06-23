// @ts-nocheck

import {
    calcApplePodcastPerformanceQuarters,
    removeLongtailFromPerformanceData,
} from './performance'

const buildTestStructure = function (arr) {
    let counter = 0
    return arr.map((v) => {
        const ret = {}
        ret[String(++counter)] = v
        return ret
    })
}

describe('calculate quarterly performance data of an episode', () => {
    it('simplest case of 4 values', () => {
        const testdata = buildTestStructure([1, 2, 3, 4])
        const res = calcApplePodcastPerformanceQuarters(testdata)
        expect(res.maxListeners).toBe(4)
        expect(res.quarterMedianValues).toStrictEqual([1, 2, 3, 4])
    })

    it('complex case with 3 number per quarter', () => {
        const testdata = buildTestStructure([
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
        ])
        const res = calcApplePodcastPerformanceQuarters(testdata)
        expect(res.maxListeners).toBe(12)
        expect(res.quarterMedianValues).toStrictEqual([2, 5, 8, 11])
    })

    it('only 3 values throws an exception', () => {
        const testdata = buildTestStructure([1, 2, 3])
        // if the episode is too new we just set all values to 0
        const res = calcApplePodcastPerformanceQuarters(testdata)
        expect(res.maxListeners).toBe(0)
        expect(res.quarterMedianValues).toStrictEqual([0, 0, 0, 0])
    })

    it('weird apple data having a longtail', () => {
        const testdata = buildTestStructure([
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 21, 1, 1, 1, 1, 1, 1, 1,
        ])
        const res = calcApplePodcastPerformanceQuarters(testdata)
        expect(res.maxListeners).toBe(21)
        expect(res.quarterMedianValues).toStrictEqual([2, 5, 8, 11])
    })

    it('weird apple data having a falling longtail', () => {
        const testdata = buildTestStructure([
            300, 250, 200, 190, 231, 210, 200, 200, 200, 50, 40, 30, 20, 16, 16,
            16, 14, 10, 5, 1, 1, 1, 1, 1, 1,
        ])
        // expect a cut at 5% which is 231*0.05 = 11.55
        const res = calcApplePodcastPerformanceQuarters(testdata)
        expect(res.maxListeners).toBe(300)
        expect(res.quarterMedianValues).toStrictEqual([225, 205, 45, 16])
    })
})

describe('remove longtail from performance data', () => {
    it('simple case', () => {
        const testdata = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        const res = removeLongtailFromPerformanceData(testdata, 0.05)
        expect(res.maxListeners).toBe(9)
        expect(res.performanceValues).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    // Test with empty data
    it('empty data', () => {
        const testdata = []
        const res = removeLongtailFromPerformanceData(testdata, 0.05)
        expect(res.maxListeners).toBeUndefined()
        expect(res.performanceValues).toStrictEqual([])
    })

    // Test with only one item
    it('single item data', () => {
        const testdata = [1]
        const res = removeLongtailFromPerformanceData(testdata, 0.05)
        expect(res.maxListeners).toBe(1)
        expect(res.performanceValues).toStrictEqual([1])
    })

    it('test identical values', () => {
        const testdata = [4, 4, 4, 4, 4, 4, 4, 4, 4]
        const res = removeLongtailFromPerformanceData(testdata, 0.05)
        expect(res.maxListeners).toBe(1)
        expect(res.performanceValues).toStrictEqual([4, 4, 4, 4, 4, 4, 4, 4, 4])
    })

    // Test with zeros
    it('zeroes in data', () => {
        const testdata = [0, 0, 0, 0, 0, 0]
        const res = removeLongtailFromPerformanceData(testdata, 0.05)
        expect(res.maxListeners).toBe(0)
        expect(res.performanceValues).toStrictEqual([0, 0, 0, 0, 0, 0])
    })

    it('complex case', () => {
        const testdata = [
            300, 250, 200, 190, 231, 210, 200, 200, 200, 50, 40, 30, 20, 16, 16,
            14, 10, 5, 1, 1, 1, 1, 1, 1,
        ]
        const res = removeLongtailFromPerformanceData(testdata, 0.05)
        expect(res.maxListeners).toBe(300)
        // expect that all values in result array are greater than 300*0.05 = 15
        expect(res.performanceValues.every((v) => v > 15)).toBe(true)
    })
})
