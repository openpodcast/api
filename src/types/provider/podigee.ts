export interface PodigeeTokens {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    scope?: string
    podigee_user_id: string
    podigee_podcast_id: string
}
