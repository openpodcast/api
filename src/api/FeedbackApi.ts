import { FeedbackRepository } from '../db/FeedbackRepository'
import { HttpError } from '../types/api'

class FeedbackApi {
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

    // Warning! This expects the comment to be already sanitized
    handleCommentPost(episodeId: string, hash: string, comment: string) {
        return this.feedbackRepo.addComment(1, Number(episodeId), hash, comment)
    }

    getNumberOfComments(episodeId: string) {
        return this.feedbackRepo.getNumberOfComments(Number(episodeId))
    }
}

export { FeedbackApi }
