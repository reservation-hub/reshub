import { ReviewControllerInterface } from '@controller-adapter/Shop'
import { OrderBy } from '@entities/Common'
import { Review } from '@entities/Review'
import { UserForAuth } from '@entities/User'
import { UnauthorizedError } from '@errors/ControllerErrors'
import Logger from '@lib/Logger'
import { indexSchema } from '@review/schemas'
import ReviewService from '@review/services/ReviewService'

export type ReviewServiceInterface = {
  fetchReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth, shopId: number, page?: number,
    order?: OrderBy, take?: number): Promise<{ reviews:
      (Review & { shopName: string, clientName: string })[], totalCount: number }>
  fetchReviewWithShopNameAndClientName(user: UserForAuth, shopId: number, reviewId: number)
    : Promise<(Review & { shopName: string, clientName: string })>
}

const ReviewController: ReviewControllerInterface = {
  async index(user, query) {
    if (!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }
    const { shopId } = query
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { reviews, totalCount } = await ReviewService.fetchReviewsWithTotalCountAndShopNameAndClientName(
      user, shopId, page, order, take,
    )

    return { values: reviews, totalCount }
  },

  async show(user, query) {
    if (!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }

    const { shopId, reviewId } = query
    return ReviewService.fetchReviewWithShopNameAndClientName(user, shopId, reviewId)
  },

}

export default ReviewController
