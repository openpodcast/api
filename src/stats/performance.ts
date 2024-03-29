import { median } from 'mathjs'

const removeLongtailFromPerformanceData = function (
    performanceValues: number[],
    longtailThresholdPercent: number
): { performanceValues: number[]; maxListeners: number } {
    if (performanceValues.length === 0 || longtailThresholdPercent === 0) {
        return {
            performanceValues,
            maxListeners: 0,
        }
    }

    const maxListeners = Math.max(...performanceValues)

    const longtailThresholdValue = maxListeners * longtailThresholdPercent
    let longtailIndex = performanceValues.length - 1
    while (
        longtailIndex > 0 &&
        performanceValues[longtailIndex] <= longtailThresholdValue
    ) {
        longtailIndex--
    }
    // remove longtail from the data array
    performanceValues.splice(longtailIndex + 1)

    return {
        performanceValues,
        maxListeners,
    }
}

const calcApplePodcastPerformanceQuarters = function (
    performance: { [seconds: string]: number }[]
): { maxListeners: number; quarterMedianValues: number[] } {
    // `episodePlayHistogram` could be an empty array (or at least contain less than 4
    // values) if the episode is too new in this case we just set all values to
    // 0
    if (performance.length < 4) {
        return {
            maxListeners: 0,
            quarterMedianValues: [0, 0, 0, 0],
        }
    }

    // sort the data first by seconds of the performance data
    // should be already sorted but just to be on the safe side
    const sortedData = performance.sort((a, b) => {
        // gets the seconds value of the performance data
        const sec_a = parseFloat(Object.entries(a)[0][0]) ?? 0
        const sec_b = parseFloat(Object.entries(b)[0][0]) ?? 0
        return sec_a - sec_b
    })

    // flatten the structure to have an array of values (listeners)
    const flattenPerformanceValues = sortedData.map(
        (entry) => Object.values(entry)[0]
    )

    // Apple LTR data can contain a weird long tail, which is a way longer than the episode itself
    // filter out longtail if it is lower than the defined threshold (percent)
    // start from the end of the array
    const { performanceValues, maxListeners } =
        removeLongtailFromPerformanceData(flattenPerformanceValues, 0.05)

    // split the data into 4 quarters
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

export {
    calcApplePodcastPerformanceQuarters,
    removeLongtailFromPerformanceData,
}
