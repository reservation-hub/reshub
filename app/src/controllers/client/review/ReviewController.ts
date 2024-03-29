import { ReviewControllerInterface as ShopEndpointSocket } from '@controller-adapter/client/Shop'
import { ReviewControllerInterface as UserEndpointSocket } from '@controller-adapter/client/User'
import { indexSchema, upsertSchema } from '@client/review/schemas'
import { OrderBy as EntityOrderBy } from '@entities/Common'
import { Review as EntityReview, ReviewScore as EntityReviewScore } from '@entities/Review'
import { Review } from '@request-response-types/client/models/Review'
import { UserForAuth } from '@entities/User'
import ReviewService from '@client/review/services/ReviewService'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { convertEntityReviewScoreToDTO, convertReviewScoreToEntity } from '@dtoConverters/Review'
import { convertOrderByToEntity } from '@dtoConverters/Common'

export type ReviewServiceInterface = {
  fetchReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth | undefined, shopId: number, page?: number,
    order?: EntityOrderBy, take?: number): Promise<{ reviews:
      (EntityReview & { shopName: string, clientName: string })[], totalCount: number }>
  fetchUserReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth, page?: number,
    order?: EntityOrderBy, take?: number): Promise<{ reviews:
      (EntityReview & { shopName: string, clientName: string })[], totalCount: number }>
  insertReview(user: UserForAuth, shopId: number, text: string, score: EntityReviewScore)
    :Promise<EntityReview & { shopName: string, clientName: string }>
  updateReview(user: UserForAuth, shopId: number, reviewId: number, text: string, score: EntityReviewScore)
    :Promise<EntityReview & { shopName: string, clientName: string }>
  deleteReview(user: UserForAuth, shopId: number, reviewId: number)
    :Promise<EntityReview & { shopName: string, clientName: string }>
}

const reconstructReview = (review: EntityReview & { shopName: string, clientName: string }): Review => ({
  ...review, score: convertEntityReviewScoreToDTO(review.score),
})

const ReviewController: ShopEndpointSocket & UserEndpointSocket = {
  async list(user, query) {
    const { shopId } = query
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { reviews, totalCount } = await ReviewService.fetchReviewsWithTotalCountAndShopNameAndClientName(
      user,
      shopId,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    return { values: reviews.map(reconstructReview), totalCount }
  },

  async userReviewList(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { reviews, totalCount } = await ReviewService.fetchUserReviewsWithTotalCountAndShopNameAndClientName(
      user,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    return { values: reviews.map(reconstructReview), totalCount }
  },

  async create(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in Request')
    }
    const { shopId } = query
    const { text, score } = await upsertSchema.parseAsync(query.params)
    const review = await ReviewService.insertReview(user, shopId, text, convertReviewScoreToEntity(score))
    return reconstructReview(review)
  },

  async update(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, reviewId } = query
    const { text, score } = await upsertSchema.parseAsync(query.params)
    const review = await ReviewService.updateReview(user, shopId, reviewId, text, convertReviewScoreToEntity(score))
    return reconstructReview(review)
  },

  async delete(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, reviewId } = query
    const review = await ReviewService.deleteReview(user, shopId, reviewId)
    return reconstructReview(review)
  },

}

export default ReviewController
