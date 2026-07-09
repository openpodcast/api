type JsonPrimitive = string | number | boolean | null

type JsonValue = JsonPrimitive | JsonObject | JsonValue[]

type JsonObject = {
    [key: string]: JsonValue
}

type QueryExampleMap = Record<string, JsonObject[]>

type OpenApiSchema = {
    type?: string
    nullable?: boolean
    properties?: Record<string, OpenApiSchema>
    items?: OpenApiSchema
    additionalProperties?: boolean | OpenApiSchema
    oneOf?: OpenApiSchema[]
    example?: JsonValue
}

export const queryDataExamples: QueryExampleMap = {
    appleEpisodesLTR: [
        {
            name: 'How Small Teams Measure Growth',
            guid: 'episode-2026-07-growth-metrics',
            date: '2026-07-07',
            apple_quarter1: '92.4000',
            apple_quarter2: '81.7000',
            apple_quarter3: '68.9000',
            apple_quarter4: '54.2000',
            apple_listeners: 1840,
        },
    ],
    appleEpisodesPlays: [
        {
            date: '2026-07-07',
            name: 'How Small Teams Measure Growth',
            guid: 'episode-2026-07-growth-metrics',
            plays: 2380,
            total_time_listened: 184500,
            unique_engaged_listeners: 1420,
            unique_listeners: 1765,
        },
    ],
    applePodcastFollowers: [
        {
            date: '2026-07-07',
            total_followers: 2875,
            total_unfollowers: 318,
            gained_followers: 42,
            lost_followers: 9,
        },
    ],
    chartsRankings: [
        {
            platform: 'spotify',
            item_type: 'podcast',
            show_id: '5xSignalRoomPodcast',
            episode_id: null,
            episode_name: null,
            market: 'US',
            chart_name: 'technology',
            position: 18,
            chart_date: '2026-07-07',
        },
        {
            platform: 'apple',
            item_type: 'episode',
            show_id: '1543210987',
            episode_id: '1000667123456',
            episode_name: 'How Small Teams Measure Growth',
            market: 'DE',
            chart_name: 'Technology',
            position: 12,
            chart_date: '2026-07-07',
        },
    ],
    episodesAge: [
        {
            date: '2026-07-07',
            guid: 'episode-2026-07-growth-metrics',
            age_group: '28-34',
            listeners: 640,
            percent: '34.60',
        },
        {
            date: '2026-07-07',
            guid: 'episode-2026-07-growth-metrics',
            age_group: '0-17',
            listeners: 0,
            percent: null,
        },
    ],
    episodesDailyMetrics: [
        {
            account_id: 42,
            spotify_episode_id: '3n7SignalGrowthMetrics',
            apple_episode_id: 1000667123456,
            guid: 'episode-2026-07-growth-metrics',
            date: '2026-07-07',
            spotify_starts: 3200,
            spotify_streams: 2440,
            spotify_listeners: 2180,
            apple_plays: 2380,
            apple_listeners: 1765,
            apple_engaged_listeners: 1420,
            apple_time_listened: 184500,
        },
        {
            account_id: 42,
            spotify_episode_id: '5m2SignalTrailer',
            apple_episode_id: 1000667000123,
            guid: 'episode-2026-07-signal-trailer',
            date: '2026-07-07',
            spotify_starts: 980,
            spotify_streams: 720,
            spotify_listeners: 650,
            apple_plays: null,
            apple_listeners: null,
            apple_engaged_listeners: null,
            apple_time_listened: null,
        },
    ],
    episodesGender: [
        {
            date: '2026-07-07',
            guid: 'episode-2026-07-growth-metrics',
            gender: 'female',
            listeners: 345,
            age_group: '28-34',
        },
        {
            date: '2026-07-07',
            guid: 'episode-2026-07-growth-metrics',
            gender: 'male',
            listeners: 265,
            age_group: '28-34',
        },
    ],
    episodesLTR: [
        {
            name: 'How Small Teams Measure Growth',
            guid: 'episode-2026-07-growth-metrics',
            date: '2026-07-07',
            quarter1_combined: '91.80000000',
            quarter2_combined: '80.40000000',
            quarter3_combined: '66.70000000',
            quarter4_combined: '52.90000000',
            spotify_quarter1: 91.3,
            spotify_quarter2: 79.5,
            spotify_quarter3: 65.1,
            spotify_quarter4: 51.8,
            apple_quarter1: '92.4000',
            apple_quarter2: '81.7000',
            apple_quarter3: '68.9000',
            apple_quarter4: '54.2000',
            listeners_combined: 4020,
            apple_listeners: 1840,
            spotify_listeners: 2180,
        },
    ],
    episodesLTRHistogram: [
        {
            guid: 'episode-2026-07-growth-metrics',
            date: '2026-07-07',
            spotify_listeners_max: 2180,
            apple_listeners_max: 1840,
            spotify_histogram: [
                { '0': 2180 },
                { '15': 2095 },
                { '30': 2040 },
                { '45': 1988 },
                { '60': 1935 },
            ],
            apple_histogram: [
                { '0': 1840 },
                { '15': 1794 },
                { '30': 1728 },
                { '45': 1660 },
                { '60': 1595 },
            ],
        },
    ],
    episodesMetadata: [
        {
            account_id: 42,
            spotify_episode_id: '3n7SignalGrowthMetrics',
            apple_episode_id: 1000667123456,
            episode_name: 'How Small Teams Measure Growth',
            guid: 'episode-2026-07-growth-metrics',
            spotify_url:
                'https://open.spotify.com/episode/3n7SignalGrowthMetrics',
            spotify_release_date: '2026-07-03',
            spotify_description:
                'A practical conversation about choosing podcast metrics that help small teams make better publishing decisions.',
            spotify_duration_seconds: '2148.0000',
            spotify_language: 'en',
            spotify_explicit_content: 0,
            spotify_has_video: 0,
            spotify_artwork_url:
                'https://cdn.example.com/openpodcast/signal-room-growth.jpg',
            apple_collection_name: 'The Signal Room',
            apple_release_datetime: '2026-07-03T06:00:00Z',
            apple_release_date: '2026-07-03',
            apple_episode_number: 84,
            apple_episode_type: 'full',
        },
        {
            account_id: 42,
            spotify_episode_id: '5m2SignalTrailer',
            apple_episode_id: 1000667000123,
            episode_name: 'The Signal Room Trailer',
            guid: 'episode-2026-07-signal-trailer',
            spotify_url: 'https://open.spotify.com/episode/5m2SignalTrailer',
            spotify_release_date: '2026-06-20',
            spotify_description:
                'A short preview of the conversations coming up on The Signal Room.',
            spotify_duration_seconds: '180.0000',
            spotify_language: 'en',
            spotify_explicit_content: 0,
            spotify_has_video: 0,
            spotify_artwork_url:
                'https://cdn.example.com/openpodcast/signal-room-trailer.jpg',
            apple_collection_name: 'The Signal Room',
            apple_release_datetime: '2026-06-20 06:00:00',
            apple_release_date: '2026-06-20',
            apple_episode_number: null,
            apple_episode_type: 'trailer',
        },
    ],
    ping: [
        {
            start: '2026-07-07',
            end: '2026-07-07',
            result: 'pong',
        },
    ],
    podcastAge: [
        {
            date: '2026-07-07',
            age_group: '28-34',
            listeners: 4920,
            percent: '36.40',
        },
        {
            date: '2026-07-07',
            age_group: '35-44',
            listeners: 3180,
            percent: '23.50',
        },
    ],
    podcastFollowers: [
        {
            account_id: 42,
            date: '2026-07-07',
            spotify_total_followers: 4120,
            spotify_change_to_day_before: 36,
            apple_total_followers: 2557,
            apple_change_to_day_before: 33,
        },
    ],
    podcastGender: [
        {
            date: '2026-07-07',
            gender: 'female',
            listeners: 2550,
            age_group: '28-34',
        },
        {
            date: '2026-07-07',
            gender: 'male',
            listeners: 2210,
            age_group: '28-34',
        },
    ],
    podcastMetadata: [
        {
            account_id: 42,
            podcast_name: 'The Signal Room',
            artwork_url: 'https://cdn.example.com/openpodcast/signal-room.jpg',
            podcast_release_date: '2024-01-12',
            podcast_url: 'https://example.com/podcasts/the-signal-room',
            publisher: 'OpenPodcast Studios',
            metadata_last_updated: '2026-07-07 09:30:00',
            spotify_last_update_date: '2026-07-07',
            spotify_total_episodes: 128,
            spotify_latest_starts: 18420,
            spotify_latest_streams: 12680,
            spotify_latest_listeners: 9340,
            spotify_latest_followers: 4120,
            apple_followers_last_update: '2026-07-07',
            apple_total_followers: 2875,
            apple_total_unfollowers: 318,
        },
    ],
    spotifyCountries: [
        {
            spotify_listeners: '4360',
            spotify_country_shortcode: 'US',
            spotify_listeners_percent: '46.70',
        },
        {
            spotify_listeners: '1280',
            spotify_country_shortcode: 'DE',
            spotify_listeners_percent: '13.70',
        },
    ],
    spotifyImpressions: [
        {
            account_id: 42,
            date: '2026-07-07',
            impressions: 48250,
        },
    ],
    spotifyImpressionsFunnel: [
        {
            account_id: 42,
            date: '2026-07-07',
            step_id: 'impressions',
            step_count: 48250,
            conversion_percent: null,
        },
        {
            account_id: 42,
            date: '2026-07-07',
            step_id: 'streams',
            step_count: 12680,
            conversion_percent: '0.26280',
        },
    ],
    spotifyImpressionsSources: [
        {
            account_id: 42,
            date_start: '2026-07-01',
            date_end: '2026-07-07',
            source_id: 'HOME',
            impression_count: 28400,
        },
        {
            account_id: 42,
            date_start: '2026-07-01',
            date_end: '2026-07-07',
            source_id: 'SEARCH',
            impression_count: 9200,
        },
    ],
    spotifyPlaysSum: [
        {
            podcast_id: 42,
            spotify_total_episodes: '128',
            spotify_starts: '129400',
            spotify_streams: '91420',
            spotify_listeners: '58300',
            spotify_followers: '4120',
        },
    ],
}

const inferPrimitiveSchema = (value: JsonPrimitive): OpenApiSchema => {
    if (value === null) {
        return {
            nullable: true,
            example: null,
        }
    }

    return {
        type: typeof value,
        example: value,
    }
}

const mergeSchemas = (schemas: OpenApiSchema[]): OpenApiSchema => {
    const hasNull = schemas.some((schema) => schema.nullable && !schema.type)
    const nonNullSchemas = schemas.filter((schema) => schema.type)

    if (nonNullSchemas.length === 0) {
        return { nullable: true }
    }

    const schemaTypes = new Set(nonNullSchemas.map((schema) => schema.type))

    if (schemaTypes.size > 1) {
        return {
            oneOf: nonNullSchemas,
            nullable: hasNull || undefined,
        }
    }

    const type = nonNullSchemas[0].type

    if (type === 'object') {
        const propertyNames = new Set(
            nonNullSchemas.flatMap((schema) =>
                Object.keys(schema.properties ?? {})
            )
        )

        const properties = Array.from(propertyNames).reduce(
            (acc, propertyName) => {
                const propertySchemas = nonNullSchemas
                    .map((schema) => schema.properties?.[propertyName])
                    .filter((schema): schema is OpenApiSchema => !!schema)

                acc[propertyName] = mergeSchemas(propertySchemas)
                return acc
            },
            {} as Record<string, OpenApiSchema>
        )

        const additionalPropertySchemas = nonNullSchemas
            .map((schema) => schema.additionalProperties)
            .filter(
                (schema): schema is OpenApiSchema => typeof schema === 'object'
            )

        return {
            type: 'object',
            ...(Object.keys(properties).length > 0 ? { properties } : {}),
            additionalProperties:
                additionalPropertySchemas.length > 0
                    ? mergeSchemas(additionalPropertySchemas)
                    : false,
            nullable: hasNull || undefined,
        }
    }

    if (type === 'array') {
        return {
            type: 'array',
            items: mergeSchemas(
                nonNullSchemas
                    .map((schema) => schema.items)
                    .filter((schema): schema is OpenApiSchema => !!schema)
            ),
            nullable: hasNull || undefined,
        }
    }

    return {
        type,
        nullable: hasNull || undefined,
    }
}

const inferSchemaFromValue = (value: JsonValue): OpenApiSchema => {
    if (Array.isArray(value)) {
        return {
            type: 'array',
            items:
                value.length > 0
                    ? mergeSchemas(
                          value.map((item) => inferSchemaFromValue(item))
                      )
                    : { type: 'object' },
            example: value,
        }
    }

    if (value !== null && typeof value === 'object') {
        const entries = Object.entries(value)
        const hasOnlyDynamicNumericKeys =
            entries.length > 0 && entries.every(([key]) => /^\d+$/.test(key))

        if (hasOnlyDynamicNumericKeys) {
            return {
                type: 'object',
                additionalProperties: mergeSchemas(
                    entries.map(([, propertyValue]) =>
                        inferSchemaFromValue(propertyValue)
                    )
                ),
                example: value,
            }
        }

        const properties = entries.reduce((acc, [key, propertyValue]) => {
            acc[key] = inferSchemaFromValue(propertyValue)
            return acc
        }, {} as Record<string, OpenApiSchema>)

        return {
            type: 'object',
            properties,
            additionalProperties: false,
            example: value,
        }
    }

    return inferPrimitiveSchema(value)
}

export const getQueryDataSchema = (queryName: string): OpenApiSchema => {
    const example = queryDataExamples[queryName]

    if (!example) {
        return {
            type: 'array',
            items: { type: 'object' },
        }
    }

    return inferSchemaFromValue(example)
}

export const getQueryResponseExample = (
    queryName: string,
    startDate: string,
    endDate: string
): JsonObject | undefined => {
    const data = queryDataExamples[queryName]

    if (!data) {
        return undefined
    }

    return {
        meta: {
            query: queryName,
            accountId: '42',
            podcastId: '42',
            date: '2026-07-09 12:00:00',
            startDate,
            endDate,
            result: 'success',
        },
        data,
    }
}
