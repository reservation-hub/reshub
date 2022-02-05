import { ReviewControllerInterface } from '@controller-adapter/Shop'
import { OrderBy } from '@request-response-types/Common'
import { OrderBy as EntityOrderBy } from '@entities/Common'
import { Review } from '@entities/Review'
import { UserForAuth } from '@entities/User'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { indexSchema } from '@review/schemas'
import ReviewService from '@review/services/ReviewService'

export type ReviewServiceInterface = {
  fetchReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth, shopId: number, page?: number,
    order?: EntityOrderBy, take?: number): Promise<{ reviews:
      (Review & { shopName: string, clientName: string })[], totalCount: number }>
  fetchReviewWithShopNameAndClientName(user: UserForAuth, shopId: number, reviewId: number)
    : Promise<(Review & { shopName: string, clientName: string })>
}

const convertOrderByToEntity = (order: OrderBy): EntityOrderBy => {
  switch (order) {
    case OrderBy.ASC:
      return EntityOrderBy.ASC
    default:
      return EntityOrderBy.DESC
  }
}

const ReviewController: ReviewControllerInterface = {
  async index(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId } = query
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { reviews, totalCount } = await ReviewService.fetchReviewsWithTotalCountAndShopNameAndClientName(
      user,
      shopId,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )

    return {
      values: reviews.map(r => ({
        id: r.id,
        score: r.score,
        clientId: r.clientId,
        clientName: r.clientName,
        shopId: r.shopId,
        shopName: r.shopName,
      })),
      totalCount,
    }
  },

  async show(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }

    const { shopId, reviewId } = query
    return ReviewService.fetchReviewWithShopNameAndClientName(user, shopId, reviewId)
  },

}

export default ReviewController
