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
        const res = calcApplePodcastPerformanceQuarters({
            performance: testdata,
        })
        expect(res.maxListeners).toBe(4)
        expect(res.quarterMedianValues).toStrictEqual([1, 2, 3, 4])
    })

    it('complex case with 3 number per quarter', () => {
        const testdata = buildTestStructure([
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
        ])
        const res = calcApplePodcastPerformanceQuarters({
            performance: testdata,
        })
        expect(res.maxListeners).toBe(12)
        expect(res.quarterMedianValues).toStrictEqual([2, 5, 8, 11])
    })

    it('only 3 values throws an exception', () => {
        const testdata = buildTestStructure([1, 2, 3])
        // to catch an expection we have to wrap it in an anonymous fun
        expect(() => {
            calcApplePodcastPerformanceQuarters({ performance: testdata })
        }).toThrow('to little data to calculate quarters')
    })
})
