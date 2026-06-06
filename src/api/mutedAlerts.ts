import { MutedAlert } from './StatusApi'

// Alerts that are intentionally muted in the `/status` age-alert check.
//
// Some podcasts only report certain endpoints sporadically. For those, stale
// data is expected and would otherwise produce noisy yellow/red alerts. Add an
// entry here to silence a single podcast/endpoint combination without affecting
// the rest of the podcast's monitoring (use the podcast-wide `monitored` flag
// in the `podcasts` table if you want to mute an entire podcast instead).
//
// `endpoint` uses the `provider/endpoint` identifier from `getStatus`,
// e.g. `anchor/playsByGender`.
export const MUTED_ALERTS: MutedAlert[] = [
    // account_id 3701: the show is not very active and only reports
    // anchor/playsByGender occasionally, so the age check would otherwise fire
    // false-positive alerts. Mute it.
    { podcastId: 3701, endpoint: 'anchor/playsByGender' },
]
