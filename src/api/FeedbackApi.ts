import { FeedbackRepository } from '../db/FeedbackRepository'
import { PayloadError } from '../types/api'

const MAX_AGENT_LENGTH = 255
const MIN_COMMENT_LENGTH = 3
const MAX_COMMENT_LENGTH = 1000

const parseEpisodeId = (episodeId: string | undefined): number => {
    if (!episodeId || !/^\d+$/.test(episodeId)) {
        throw new PayloadError('Episode ID must be a positive integer')
    }

    const parsedEpisodeId = Number(episodeId)
    if (!Number.isSafeInteger(parsedEpisodeId) || parsedEpisodeId < 1) {
        throw new PayloadError('Episode ID must be a positive integer')
    }

    return parsedEpisodeId
}

const normalizeAgent = (agent: string): string => {
    return agent.trim().slice(0, MAX_AGENT_LENGTH)
}

const normalizeComment = (comment: string): string => {
    const normalizedComment = comment.trim().replace(/\r\n/g, '\n')

    if (
        normalizedComment.length < MIN_COMMENT_LENGTH ||
        normalizedComment.length > MAX_COMMENT_LENGTH
    ) {
        throw new PayloadError(
            `Comment must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters`
        )
    }

    return normalizedComment
}

const normalizeEmail = (email: string | undefined): string | undefined => {
    const normalizedEmail = email?.trim().toLowerCase()
    return normalizedEmail === '' ? undefined : normalizedEmail
}

class FeedbackApi {
    feedbackRepo: FeedbackRepository

    constructor(feedbackRepo: FeedbackRepository) {
        this.feedbackRepo = feedbackRepo
    }

    async handleApiGet(
        episodeId: string | undefined,
        userHash: string,
        agent: string,
        feedbackType: string | undefined
    ) {
        const parsedEpisodeId = parseEpisodeId(episodeId)

        if (feedbackType !== 'upvote' && feedbackType !== 'downvote') {
            throw new PayloadError('Feedback type must be upvote or downvote')
        }

        return await this.feedbackRepo.addFeedback(
            1,
            parsedEpisodeId,
            userHash,
            normalizeAgent(agent),
            feedbackType === 'upvote'
        )
    }

    handleCommentPost(
        episodeId: string | undefined,
        hash: string,
        comment: string,
        email?: string
    ) {
        const parsedEpisodeId = parseEpisodeId(episodeId)
        const normalizedComment = normalizeComment(comment)
        const normalizedEmail = normalizeEmail(email)

        return this.feedbackRepo.addComment(
            1,
            parsedEpisodeId,
            hash,
            normalizedComment,
            normalizedEmail
        )
    }

    getNumberOfComments(episodeId: string | undefined) {
        return this.feedbackRepo.getNumberOfComments(parseEpisodeId(episodeId))
    }
}

export { FeedbackApi }
