import { ReviewControllerInterface } from '@controller-adapter/client/Shop'
import { indexSchema, upsertSchema } from '@client/review/schemas'
import { OrderBy } from '@entities/Common'
import { Review, ReviewScore } from '@entities/Review'
import { UserForAuth } from '@entities/User'
import ReviewService from '@client/review/services/ReviewService'
import { UnauthorizedError } from '@errors/ControllerErrors'

export type ReviewServiceInterface = {
  fetchReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth | undefined, shopId: number, page?: number,
    order?: OrderBy, take?: number): Promise<{ reviews:
      (Review & { shopName: string, clientName: string })[], totalCount: number }>
  updateReview(user: UserForAuth, shopId: number, reviewId: number, text: string, score: ReviewScore)
    :Promise<Review>
  insertReview(user: UserForAuth, shopId: number, text: string, score: ReviewScore)
    :Promise<Review>
  deleteReview(user: UserForAuth, shopId: number, reviewId: number)
    :Promise<Review>
}

const ReviewController: ReviewControllerInterface = {
  async list(user, query) {
    const { shopId } = query
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { reviews, totalCount } = await ReviewService.fetchReviewsWithTotalCountAndShopNameAndClientName(
      user, shopId, page, order, take,
    )
    return { values: reviews, totalCount }
  },

  async update(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found')
    }
    const { shopId, reviewId } = query
    const { text, score } = await upsertSchema.parseAsync(query.params)
    await ReviewService.updateReview(user, shopId, reviewId, text, score)
    return 'review updated'
  },
  async create(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in Request')
    }
    const { shopId } = query
    const { text, score } = await upsertSchema.parseAsync(query.params)
    await ReviewService.insertReview(user, shopId, text, score)
    return 'Review created'
  },
  async delete(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found')
    }
    const { shopId, reviewId } = query
    await ReviewService.deleteReview(user, shopId, reviewId)
    return 'Review deleted'
  },
}

export default ReviewController
