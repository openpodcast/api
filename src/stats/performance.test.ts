// @ts-nocheck

import { calcApplePodcastPerformanceQuarters } from './performance'

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
})
