import { FeedbackApi } from './FeedbackApi'
import { FeedbackRepository } from '../db/FeedbackRepository'
import { PayloadError } from '../types/api'

const createFeedbackApi = () => {
    const feedbackRepo = {
        addFeedback: jest.fn(),
        addComment: jest.fn(),
        getNumberOfComments: jest.fn(),
    } as unknown as FeedbackRepository

    return {
        feedbackApi: new FeedbackApi(feedbackRepo),
        feedbackRepo,
    }
}

describe('FeedbackApi', () => {
    it('stores a normalized upvote', async () => {
        const { feedbackApi, feedbackRepo } = createFeedbackApi()

        await feedbackApi.handleApiGet(
            '123',
            'user-hash',
            '  Mozilla/5.0  ',
            'upvote'
        )

        expect(feedbackRepo.addFeedback).toHaveBeenCalledWith(
            1,
            123,
            'user-hash',
            'Mozilla/5.0',
            true
        )
    })

    it('rejects invalid vote requests', async () => {
        const { feedbackApi, feedbackRepo } = createFeedbackApi()

        await expect(
            feedbackApi.handleApiGet('0', 'user-hash', 'agent', 'upvote')
        ).rejects.toBeInstanceOf(PayloadError)
        await expect(
            feedbackApi.handleApiGet('123', 'user-hash', 'agent', 'sidevote')
        ).rejects.toBeInstanceOf(PayloadError)

        expect(feedbackRepo.addFeedback).not.toHaveBeenCalled()
    })

    it('truncates long user agents before storage', async () => {
        const { feedbackApi, feedbackRepo } = createFeedbackApi()

        await feedbackApi.handleApiGet(
            '123',
            'user-hash',
            'x'.repeat(300),
            'downvote'
        )

        expect(feedbackRepo.addFeedback).toHaveBeenCalledWith(
            1,
            123,
            'user-hash',
            'x'.repeat(255),
            false
        )
    })

    it('stores a trimmed comment with normalized email', async () => {
        const { feedbackApi, feedbackRepo } = createFeedbackApi()

        await feedbackApi.handleCommentPost(
            '456',
            'user-hash',
            '  Great episode!\r\nThanks.  ',
            ' TEST@EXAMPLE.COM '
        )

        expect(feedbackRepo.addComment).toHaveBeenCalledWith(
            1,
            456,
            'user-hash',
            'Great episode!\nThanks.',
            'test@example.com'
        )
    })

    it('rejects invalid comments before storage', async () => {
        const { feedbackApi, feedbackRepo } = createFeedbackApi()

        expect(() =>
            feedbackApi.handleCommentPost('456', 'user-hash', 'no')
        ).toThrow(PayloadError)
        expect(() =>
            feedbackApi.handleCommentPost('not-a-number', 'user-hash', 'Nice')
        ).toThrow(PayloadError)

        expect(feedbackRepo.addComment).not.toHaveBeenCalled()
    })
})
