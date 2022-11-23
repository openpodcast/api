import { median } from 'mathjs'

const calcApplePodcastPerformanceQuarters = function (
    performance: { [seconds: string]: number }[]
): { maxListeners: number; quarterMedianValues: number[] } {
    // sort the data first by seconds of the performance data
    // should be already sorted but just to be on the safe side
    const sortedData = performance.sort((a, b) => {
        // gets the seconds value of the performance data
        const sec_a = parseFloat(Object.entries(a)[0][0]) ?? 0
        const sec_b = parseFloat(Object.entries(b)[0][0]) ?? 0
        return sec_a - sec_b
    })

    // flatten the structure to have an array of values (listeners)
    const performanceValues = sortedData.map((entry) => Object.values(entry)[0])

    const maxListeners = Math.max(...performanceValues)

    if (performanceValues.length < 4) {
        throw Error('too little data to calculate quarters')
    }

    const quarterSize = Math.floor(performanceValues.length / 4)

    const quarterMedianValues = [
        median(performanceValues.slice(0, quarterSize)),
        median(performanceValues.slice(quarterSize, 2 * quarterSize)),
        median(performanceValues.slice(2 * quarterSize, 3 * quarterSize)),
        median(performanceValues.slice(3 * quarterSize)),
    ]

    return {
        maxListeners,
        quarterMedianValues,
    }
}

export { calcApplePodcastPerformanceQuarters }