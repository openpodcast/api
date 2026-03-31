import {
    normalizeAnchorEpisodeId,
    extractSpotifyIdFromTrackedUrl,
    extractSpotifyIdFromUri,
} from '../../src/utils/anchorId'
import { PayloadError } from '../../src/types/api'

describe('normalizeAnchorEpisodeId', () => {
    it('should return undefined for undefined input', () => {
        expect(normalizeAnchorEpisodeId(undefined)).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
        expect(normalizeAnchorEpisodeId('')).toBeUndefined()
    })

    it('should return bare base62 ID as-is', () => {
        expect(normalizeAnchorEpisodeId('6PevkuxlaCBQnXfKyTgU7G')).toBe(
            '6PevkuxlaCBQnXfKyTgU7G'
        )
    })

    it('should extract ID from spotify:episode: URI', () => {
        expect(
            normalizeAnchorEpisodeId('spotify:episode:6PevkuxlaCBQnXfKyTgU7G')
        ).toBe('6PevkuxlaCBQnXfKyTgU7G')
    })

    it('should extract ID from Spotify URL', () => {
        expect(
            normalizeAnchorEpisodeId(
                'https://open.spotify.com/episode/6PevkuxlaCBQnXfKyTgU7G'
            )
        ).toBe('6PevkuxlaCBQnXfKyTgU7G')
    })

    it('should extract ID from Spotify URL with query params', () => {
        expect(
            normalizeAnchorEpisodeId(
                'https://open.spotify.com/episode/6PevkuxlaCBQnXfKyTgU7G?si=abc123'
            )
        ).toBe('6PevkuxlaCBQnXfKyTgU7G')
    })

    it('should throw PayloadError for old-style web episode IDs', () => {
        expect(() => normalizeAnchorEpisodeId('e215pm4')).toThrow(PayloadError)
    })

    it('should throw PayloadError for numeric IDs', () => {
        expect(() => normalizeAnchorEpisodeId('67347583')).toThrow(PayloadError)
    })

    it('should throw PayloadError for invalid strings', () => {
        expect(() => normalizeAnchorEpisodeId('not-a-valid-id')).toThrow(
            PayloadError
        )
    })

    it('should throw PayloadError for anchor.fm URLs', () => {
        expect(() =>
            normalizeAnchorEpisodeId(
                'https://anchor.fm/s/undefined/podcast/play/undefined/undefined'
            )
        ).toThrow(PayloadError)
    })
})

describe('extractSpotifyIdFromTrackedUrl', () => {
    it('should return undefined for undefined input', () => {
        expect(extractSpotifyIdFromTrackedUrl(undefined)).toBeUndefined()
    })

    it('should return undefined for null input', () => {
        expect(extractSpotifyIdFromTrackedUrl(null)).toBeUndefined()
    })

    it('should return undefined for non-Spotify URL', () => {
        expect(
            extractSpotifyIdFromTrackedUrl(
                'https://anchor.fm/s/undefined/podcast/play/undefined/undefined'
            )
        ).toBeUndefined()
    })

    it('should extract ID from Spotify URL', () => {
        expect(
            extractSpotifyIdFromTrackedUrl(
                'https://open.spotify.com/episode/6PevkuxlaCBQnXfKyTgU7G'
            )
        ).toBe('6PevkuxlaCBQnXfKyTgU7G')
    })
})

describe('extractSpotifyIdFromUri', () => {
    it('should return undefined for undefined input', () => {
        expect(extractSpotifyIdFromUri(undefined)).toBeUndefined()
    })

    it('should return undefined for null input', () => {
        expect(extractSpotifyIdFromUri(null)).toBeUndefined()
    })

    it('should extract ID from Spotify URI', () => {
        expect(
            extractSpotifyIdFromUri('spotify:episode:1cPUh123example1234567')
        ).toBe('1cPUh123example1234567')
    })

    it('should return undefined for non-matching URI', () => {
        expect(extractSpotifyIdFromUri('not-a-uri')).toBeUndefined()
    })
})
