import { StatusRepository } from '../db/StatusRepository'
import { StatusPayload } from '../types/api'

// An alert that is intentionally muted, identified by the podcast (account id)
// and the endpoint identifier in the `provider/endpoint` format used by
// `getStatus` (e.g. `anchor/playsByGender`).
export type MutedAlert = {
    podcastId: number
    endpoint: string
}

class StatusApi {
    statusRepo: StatusRepository

    constructor(statusRepo: StatusRepository) {
        this.statusRepo = statusRepo
    }

    // Returns the latest status for the given accountId and endpoint
    async getStatus() {
        return await this.statusRepo.getStatus()
    }

    // checks all dates and create yellow and red alerts if too old
    // returns an object with the alerts if there are any
    //
    // `mutedAlerts` lists podcast/endpoint combinations that should never
    // generate an alert, e.g. for podcasts that only report a given endpoint
    // sporadically and would otherwise produce noisy false positives.
    getAgeAlerts(
        statusData: {
            [podcastId: number]: {
                latestUpdates: { [endpointName: string]: Date }
            }
        },
        yellowAgeHours: number,
        redAgeHours: number,
        mutedAlerts: MutedAlert[] = []
    ) {
        type AlertData = {
            podcastId: number
            endpoint: string
            ageHours: number
        }
        const yellowAlerts: AlertData[] = []
        const redAlerts: AlertData[] = []
        Object.entries(statusData).forEach(([podcastIdStr, podcastData]) => {
            // as entries returns key as string, cast to number
            const podcastId = parseInt(podcastIdStr)
            Object.entries(podcastData.latestUpdates).forEach(
                ([endpointName, endpointDate]) => {
                    // skip alerts that have been explicitly muted for this
                    // podcast/endpoint combination
                    const isMuted = mutedAlerts.some(
                        (muted) =>
                            muted.podcastId === podcastId &&
                            muted.endpoint === endpointName
                    )
                    if (isMuted) {
                        return
                    }
                    const ageHours = Math.round(
                        (new Date().getTime() -
                            new Date(endpointDate).getTime()) /
                            (1000 * 60 * 60)
                    )
                    if (ageHours >= redAgeHours) {
                        redAlerts.push({
                            podcastId: podcastId,
                            endpoint: endpointName,
                            ageHours: ageHours,
                        })
                    } else if (ageHours >= yellowAgeHours) {
                        yellowAlerts.push({
                            podcastId: podcastId,
                            endpoint: endpointName,
                            ageHours: ageHours,
                        })
                    }
                }
            )
        })
        const alerts: { yellow?: AlertData[]; red?: AlertData[] } = {}
        // only add alerts if there are any
        // this allows the client to look for the presence of the key yellow or red
        // to determine if there are any alerts. this is easier for monitors as
        // they don't have to parse json
        if (yellowAlerts.length > 0) {
            alerts.yellow = yellowAlerts
        }
        if (redAlerts.length > 0) {
            alerts.red = redAlerts
        }
        return alerts
    }

    async updateStatus(accountId: number, update: StatusPayload): Promise<any> {
        return await this.statusRepo.updateStatus(accountId, update)
    }
}

export { StatusApi }
