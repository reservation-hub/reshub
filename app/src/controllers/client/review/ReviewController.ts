import { ReviewControllerInterface } from '@controller-adapter/client/Shop'
import { indexSchema } from '@client/review/schemas'
import { OrderBy } from '@entities/Common'
import { Review } from '@entities/Review'
import { User, UserForAuth } from '@entities/User'
import ReviewService from '@client/review/services/ReviewService'

export type ReviewServiceInterface = {
  fetchReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth | undefined, shopId: number, page?: number,
    order?: OrderBy, take?: number): Promise<{ reviews:
      (Review & { shopName: string, clientName: string })[], totalCount: number }>
  fetchReviewWithShopNameAndClientName(user: UserForAuth | undefined, shopId: number, reviewId: number)
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

  async show(user, query) {
    const { shopId, reviewId } = query
    return ReviewService.fetchReviewWithShopNameAndClientName(user, shopId, reviewId)
  },
}

export default ReviewController
