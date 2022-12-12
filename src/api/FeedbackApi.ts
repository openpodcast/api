import { FeedbackRepository } from '../db/FeedbackRepository'
import { HttpError } from '../types/api'
import crypto from 'crypto'

class FeedbackApi {
    feedbackRepo: FeedbackRepository

    constructor(feedbackRepo: FeedbackRepository) {
        this.feedbackRepo = feedbackRepo
    }

    async handleApiGet(
        episodeId: string | undefined,
        ip = '',
        agent = '',
        feedbackType: string | undefined
    ) {
        // calc sha hash based on ip and agent
        const userHash = crypto
            .createHash('sha256')
            .update(ip + agent)
            .digest('hex')
        if (
            feedbackType !== undefined &&
            episodeId !== undefined &&
            !isNaN(Number(episodeId)) &&
            (feedbackType === 'thumbsup' || feedbackType === 'thumbsdown')
        ) {
            return await this.feedbackRepo.addFeedback(
                1,
                Number(episodeId),
                userHash,
                feedbackType === 'thumbsup'
            )
        } else {
            throw new HttpError('Invalid feedback request')
        }
    }
}

export { FeedbackApi }
