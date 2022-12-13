import { FeedbackRepository } from '../db/FeedbackRepository'
import { HttpError } from '../types/api'

class FeedbackApi {
    handleCommentPost(episodeId: string, hash: string, comment: string) {
        if (comment.length > 1000) {
            throw new HttpError('Comment too long')
        }
        // Some basic sanitization. This is not a security feature.
        comment = comment.replace(/</g, '&lt;').replace(/>/g, '&gt;')

        return this.feedbackRepo.addComment(1, Number(episodeId), hash, comment)
    }
    feedbackRepo: FeedbackRepository

    constructor(feedbackRepo: FeedbackRepository) {
        this.feedbackRepo = feedbackRepo
    }

    async handleApiGet(
        episodeId: string | undefined,
        userHash: string,
        feedbackType: string | undefined
    ) {
        if (
            feedbackType !== undefined &&
            episodeId !== undefined &&
            !isNaN(Number(episodeId)) &&
            (feedbackType === 'upvote' || feedbackType === 'downvote')
        ) {
            return await this.feedbackRepo.addFeedback(
                1,
                Number(episodeId),
                userHash,
                feedbackType === 'upvote'
            )
        } else {
            throw new HttpError('Invalid feedback request')
        }
    }
}

export { FeedbackApi }
