import { PayloadError } from '../types/api'

// Spotify base62 characters: [0-9a-zA-Z]
// Spotify IDs are typically 22 characters long
const SPOTIFY_BASE62_REGEX = /^[0-9a-zA-Z]{22}$/
const SPOTIFY_URI_REGEX = /^spotify:episode:([0-9a-zA-Z]{22})$/
const SPOTIFY_URL_REGEX =
    /^https?:\/\/open\.spotify\.com\/episode\/([0-9a-zA-Z]{22})/

/**
 * Extracts the Spotify base62 episode ID from various formats:
 * - spotify:episode:XXXXX → XXXXX
 * - https://open.spotify.com/episode/XXXXX → XXXXX
 * - bare base62 ID → as-is
 *
 * If the input is undefined or empty, returns undefined (keep old format).
 * Throws PayloadError (400) for invalid formats.
 */
export function normalizeAnchorEpisodeId(
    id: string | undefined
): string | undefined {
    if (id === undefined || id === '') {
        return undefined
    }

    // Try bare base62 ID
    if (SPOTIFY_BASE62_REGEX.test(id)) {
        return id
    }

    // Try spotify:episode:XXXXX URI
    const uriMatch = id.match(SPOTIFY_URI_REGEX)
    if (uriMatch) {
        return uriMatch[1]
    }

    // Try https://open.spotify.com/episode/XXXXX URL
    const urlMatch = id.match(SPOTIFY_URL_REGEX)
    if (urlMatch) {
        return urlMatch[1]
    }

    throw new PayloadError(
        `Invalid Anchor episode ID format: '${id}'. Expected a Spotify base62 ID, spotify:episode:XXX URI, or https://open.spotify.com/episode/XXX URL.`
    )
}

/**
 * Extracts the Spotify base62 episode ID from a tracked URL.
 * Returns undefined if the URL doesn't contain a valid Spotify episode ID.
 *
 * Example: https://open.spotify.com/episode/6PevkuxlaCBQnXfKyTgU7G → 6PevkuxlaCBQnXfKyTgU7G
 */
export function extractSpotifyIdFromTrackedUrl(
    trackedUrl: string | undefined | null
): string | undefined {
    if (!trackedUrl) {
        return undefined
    }

    const match = trackedUrl.match(SPOTIFY_URL_REGEX)
    if (match) {
        return match[1]
    }

    return undefined
}

/**
 * Extracts the Spotify base62 episode ID from a Spotify URI.
 * Returns undefined if the URI doesn't match the expected format.
 *
 * Example: spotify:episode:1cPUh123example1234567 → 1cPUh123example1234567
 */
export function extractSpotifyIdFromUri(
    uri: string | undefined | null
): string | undefined {
    if (!uri) {
        return undefined
    }

    const match = uri.match(SPOTIFY_URI_REGEX)
    if (match) {
        return match[1]
    }

    return undefined
}
