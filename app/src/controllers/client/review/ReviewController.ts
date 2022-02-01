import { ReviewControllerInterface } from '@controller-adapter/client/Shop'
import { indexSchema } from '@client/review/schemas'
import { OrderBy } from '@entities/Common'
import { Review } from '@entities/Review'
import { UserForAuth } from '@entities/User'
import ReviewService from '@client/review/services/ReviewService'

export type ReviewServiceInterface = {
  fetchReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth | undefined, shopId: number, page?: number,
    order?: OrderBy, take?: number): Promise<{ reviews:
      (Review & { shopName: string, clientName: string })[], totalCount: number }>
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
}

export default ReviewController
