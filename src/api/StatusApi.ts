import { StatusRepository, Status } from '../db/StatusRepository'
import { StatusPayload } from '../types/api'

type AlertData = {
    podcastId: number
    endpoint: string
    ageHours: number
}

type ImportIssue = {
    podcastId: number
    provider: string
    endpoint: string
    latestUpdateAt: string
    ageHours: number
    severity: 'stale' | 'concerning' | 'serious'
    severityLabel: string
    guidance: string
}

type ImportIssueSummary = {
    issueCount: number
    affectedPodcastCount: number
    affectedEndpointCount: number
    worstAgeHours: number | null
    hasIssues: boolean
}

type EndpointIssueGroup = {
    provider: string
    endpoint: string
    issueCount: number
    affectedPodcastCount: number
    worstAgeHours: number
    severity: ImportIssue['severity']
    severityLabel: string
    issues: ImportIssue[]
}

type PodcastIssueGroup = {
    podcastId: number
    issueCount: number
    affectedEndpointCount: number
    worstAgeHours: number
    severity: ImportIssue['severity']
    severityLabel: string
    issues: ImportIssue[]
}

type ImportIssueReport = {
    summary: ImportIssueSummary
    endpointGroups: EndpointIssueGroup[]
    podcastGroups: PodcastIssueGroup[]
    issues: ImportIssue[]
}

const getEndpointAgeHours = (endpointDate: Date) => {
    return Math.round(
        (new Date().getTime() - new Date(endpointDate).getTime()) /
            (1000 * 60 * 60)
    )
}

const splitEndpointIdentifier = (identifier: string) => {
    const [provider, ...endpointParts] = identifier.split('/')

    return {
        provider,
        endpoint: endpointParts.join('/'),
    }
}

const formatDateTime = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
}

const getIssueSeverity = (ageHours: number): ImportIssue['severity'] => {
    if (ageHours >= 72) {
        return 'serious'
    }

    if (ageHours >= 48) {
        return 'concerning'
    }

    return 'stale'
}

const getIssueSeverityLabel = (severity: ImportIssue['severity']) => {
    if (severity === 'serious') {
        return 'Needs attention'
    }

    if (severity === 'concerning') {
        return 'Concerning'
    }

    return 'Stale'
}

const getIssueGuidance = (severity: ImportIssue['severity']) => {
    if (severity === 'serious') {
        return 'Check the import pipeline and provider credentials.'
    }

    if (severity === 'concerning') {
        return 'Check whether the pipeline is delayed or stuck.'
    }

    return 'Watch this import; it is older than the daily window.'
}

const sortIssues = (issues: ImportIssue[]) => {
    issues.sort((a, b) => {
        if (b.ageHours !== a.ageHours) {
            return b.ageHours - a.ageHours
        }

        if (a.podcastId !== b.podcastId) {
            return a.podcastId - b.podcastId
        }

        return `${a.provider}/${a.endpoint}`.localeCompare(
            `${b.provider}/${b.endpoint}`
        )
    })
}

const getEndpointIssueGroups = (issues: ImportIssue[]) => {
    const groupIssuesByEndpoint: {
        [endpointIdentifier: string]: ImportIssue[]
    } = {}

    issues.forEach((issue) => {
        const endpointIdentifier = `${issue.provider}/${issue.endpoint}`

        if (!groupIssuesByEndpoint[endpointIdentifier]) {
            groupIssuesByEndpoint[endpointIdentifier] = []
        }

        groupIssuesByEndpoint[endpointIdentifier].push(issue)
    })

    const groups = Object.values(groupIssuesByEndpoint).map((groupIssues) => {
        sortIssues(groupIssues)

        const worstIssue = groupIssues[0]
        const affectedPodcasts = new Set(
            groupIssues.map((issue) => issue.podcastId)
        )

        return {
            provider: worstIssue.provider,
            endpoint: worstIssue.endpoint,
            issueCount: groupIssues.length,
            affectedPodcastCount: affectedPodcasts.size,
            worstAgeHours: worstIssue.ageHours,
            severity: worstIssue.severity,
            severityLabel: worstIssue.severityLabel,
            issues: groupIssues,
        }
    })

    groups.sort((a, b) => {
        if (b.worstAgeHours !== a.worstAgeHours) {
            return b.worstAgeHours - a.worstAgeHours
        }

        return `${a.provider}/${a.endpoint}`.localeCompare(
            `${b.provider}/${b.endpoint}`
        )
    })

    return groups
}

const getPodcastIssueGroups = (issues: ImportIssue[]) => {
    const groupIssuesByPodcast: { [podcastId: number]: ImportIssue[] } = {}

    issues.forEach((issue) => {
        if (!groupIssuesByPodcast[issue.podcastId]) {
            groupIssuesByPodcast[issue.podcastId] = []
        }

        groupIssuesByPodcast[issue.podcastId].push(issue)
    })

    const groups = Object.entries(groupIssuesByPodcast).map(
        ([podcastIdStr, groupIssues]) => {
            sortIssues(groupIssues)

            const worstIssue = groupIssues[0]
            const affectedEndpoints = new Set(
                groupIssues.map(
                    (issue) => `${issue.provider}/${issue.endpoint}`
                )
            )

            return {
                podcastId: parseInt(podcastIdStr),
                issueCount: groupIssues.length,
                affectedEndpointCount: affectedEndpoints.size,
                worstAgeHours: worstIssue.ageHours,
                severity: worstIssue.severity,
                severityLabel: worstIssue.severityLabel,
                issues: groupIssues,
            }
        }
    )

    groups.sort((a, b) => {
        if (b.worstAgeHours !== a.worstAgeHours) {
            return b.worstAgeHours - a.worstAgeHours
        }

        return a.podcastId - b.podcastId
    })

    return groups
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
    getAgeAlerts(
        statusData: {
            [podcastId: number]: {
                latestUpdates: { [endpointName: string]: Date }
            }
        },
        yellowAgeHours: number,
        redAgeHours: number
    ) {
        const yellowAlerts: AlertData[] = []
        const redAlerts: AlertData[] = []
        Object.entries(statusData).forEach(([podcastIdStr, podcastData]) => {
            // as entries returns key as string, cast to number
            const podcastId = parseInt(podcastIdStr)
            Object.entries(podcastData.latestUpdates).forEach(
                ([endpointName, endpointDate]) => {
                    const ageHours = getEndpointAgeHours(endpointDate)
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

    getImportIssueReport(
        status: Status,
        staleAgeHours: number
    ): ImportIssueReport {
        const affectedPodcasts = new Set<number>()
        const affectedEndpoints = new Set<string>()
        const issues: ImportIssue[] = []

        Object.entries(status).forEach(([podcastIdStr, podcastData]) => {
            const podcastId = parseInt(podcastIdStr)

            Object.entries(podcastData.latestUpdates).forEach(
                ([endpointIdentifier, endpointDate]) => {
                    const ageHours = getEndpointAgeHours(endpointDate)

                    if (ageHours < staleAgeHours) {
                        return
                    }

                    const { provider, endpoint } =
                        splitEndpointIdentifier(endpointIdentifier)
                    const severity = getIssueSeverity(ageHours)

                    affectedPodcasts.add(podcastId)
                    affectedEndpoints.add(endpointIdentifier)
                    issues.push({
                        podcastId,
                        provider,
                        endpoint,
                        latestUpdateAt: formatDateTime(endpointDate),
                        ageHours,
                        severity,
                        severityLabel: getIssueSeverityLabel(severity),
                        guidance: getIssueGuidance(severity),
                    })
                }
            )
        })

        sortIssues(issues)

        return {
            summary: {
                issueCount: issues.length,
                affectedPodcastCount: affectedPodcasts.size,
                affectedEndpointCount: affectedEndpoints.size,
                worstAgeHours: issues[0]?.ageHours ?? null,
                hasIssues: issues.length > 0,
            },
            endpointGroups: getEndpointIssueGroups(issues),
            podcastGroups: getPodcastIssueGroups(issues),
            issues,
        }
    }

    async updateStatus(accountId: number, update: StatusPayload): Promise<any> {
        return await this.statusRepo.updateStatus(accountId, update)
    }
}

export { StatusApi, ImportIssue, ImportIssueReport }
