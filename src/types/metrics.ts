// ids have to match the seeded rows in the platforms and metrics tables
// (see db_schema/schema.sql and db_schema/migrations/19_v2_metrics.sql)
export const PLATFORM = {
    spotify: 1,
    apple: 2,
    anchor: 3,
    podigee: 4,
} as const

export const METRIC = {
    plays: 1,
} as const

export type PlatformId = typeof PLATFORM[keyof typeof PLATFORM]
export type MetricId = typeof METRIC[keyof typeof METRIC]

// value of a metric for a date range
// daily values have the same start and end date
export interface MetricValue {
    start: string
    end: string
    value: number
}
