import { ReviewControllerInterface } from '@controller-adapter/client/Shop'
import { indexSchema, reviewInsertSchema } from '@client/review/schemas'
import { OrderBy } from '@entities/Common'
import { Review } from '@entities/Review'
import { UserForAuth } from '@entities/User'
import ReviewService from '@client/review/services/ReviewService'
import Logger from '@lib/Logger'
import { UnauthorizedError } from '@errors/RouteErrors'
import { ReviewScore } from '@prisma/client'
import { NotFoundError } from '@errors/ServiceErrors'

export type ReviewServiceInterface = {
  fetchReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth | undefined, shopId: number, page?: number,
    order?: OrderBy, take?: number): Promise<{ reviews:
      (Review & { shopName: string, clientName: string })[], totalCount: number }>
  makeReview(user: UserForAuth | undefined, shopId: number, review: string, reviewScore: ReviewScore): Promise<Review>    
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
  
  async add(user, query) {
    if(!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }
    const { shopId, review, reviewScore } = await reviewInsertSchema.parseAsync(query)
    const shop = await ReviewService.makeReview(user, shopId, review, reviewScore)
    if(!shop) {
      Logger.debug('The shop doest exist')
      throw new NotFoundError()
    }
    return 'Review created'

  }
}

export default ReviewController
