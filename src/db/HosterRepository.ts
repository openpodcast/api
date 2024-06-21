import {} from '../types/provider/hoster'

const getDateDBString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1)
    const day = String(date.getDate())

    return `${year}-${month}-${day}`
}

const getTodayDBString = (): string => {
    return getDateDBString(new Date())
}

// Convert unix timestamp in seconds or milliseconds to Date string in
// format YYYY-MM-DD
const getDateFromTimestamp = (timestamp: number | string): string => {
    // Convert milliseconds to seconds if necessary
    if (timestamp.toString().length === 13) {
        timestamp = Number(timestamp) / 1000
    }
    const date = new Date(Number(timestamp) * 1000)
    return getDateDBString(date)
}

class HosterRepository {
    pool

    constructor(pool: any) {
        this.pool = pool
    }

    async storeHosterPodcastMetadata(
        accountId: number,
        data: RawHosterPodcastAnalyticsData
    ): Promise<any> {
        throw new Error('Method not implemented.')

        // // audienceSize.rows is an array with a single element
        // const audienceSize = data.rows[0]

        // const replaceStmt = `REPLACE INTO anchorAudienceSize (
        //     account_id,
        //     date,
        //     audience_size
        //     ) VALUES
        //     (?,?,?)`

        // return await this.pool.query(replaceStmt, [
        //     accountId,
        //     getTodayDBString(),
        //     audienceSize,
        // ])
    }
}

export { HosterRepository }
