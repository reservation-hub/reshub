import { ReviewControllerInterface as ShopEndpointSocket } from '@controller-adapter/client/Shop'
import { ReviewControllerInterface as UserEndpointSocket } from '@controller-adapter/client/User'
import { indexSchema, upsertSchema } from '@client/review/schemas'
import { OrderBy } from '@request-response-types/client/Common'
import { OrderBy as EntityOrderBy } from '@entities/Common'
import { Review, ReviewScore as EntityReviewScore } from '@entities/Review'
import { ReviewScore } from '@request-response-types/client/models/Review'
import { UserForAuth } from '@entities/User'
import ReviewService from '@client/review/services/ReviewService'
import { UnauthorizedError } from '@errors/ControllerErrors'

export type ReviewServiceInterface = {
  fetchReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth | undefined, shopId: number, page?: number,
    order?: EntityOrderBy, take?: number): Promise<{ reviews:
      (Review & { shopName: string, clientName: string })[], totalCount: number }>
  fetchUserReviewsWithTotalCountAndShopNameAndClientName(user: UserForAuth, page?: number,
    order?: EntityOrderBy, take?: number): Promise<{ reviews:
      (Review & { shopName: string, clientName: string })[], totalCount: number }>
  updateReview(user: UserForAuth, shopId: number, reviewId: number, text: string, score: EntityReviewScore)
    :Promise<Review>
  insertReview(user: UserForAuth, shopId: number, text: string, score: EntityReviewScore)
    :Promise<Review>
  deleteReview(user: UserForAuth, shopId: number, reviewId: number)
    :Promise<Review>
}

const convertOrderByToEntity = (order: OrderBy): EntityOrderBy => {
  switch (order) {
    case OrderBy.ASC:
      return EntityOrderBy.ASC
    default:
      return EntityOrderBy.DESC
  }
}

const convertReviewScoreToEntity = (reviewScore: ReviewScore): EntityReviewScore => {
  switch (reviewScore) {
    case ReviewScore.one:
      return EntityReviewScore.one
    case ReviewScore.two:
      return EntityReviewScore.two
    case ReviewScore.three:
      return EntityReviewScore.three
    case ReviewScore.four:
      return EntityReviewScore.four
    default:
      return EntityReviewScore.five
  }
}

const convertEntityReviewScoreToDTO = (reviewScore: EntityReviewScore): ReviewScore => {
  switch (reviewScore) {
    case EntityReviewScore.one:
      return ReviewScore.one
    case EntityReviewScore.two:
      return ReviewScore.two
    case EntityReviewScore.three:
      return ReviewScore.three
    case EntityReviewScore.four:
      return ReviewScore.four
    default:
      return ReviewScore.five
  }
}

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
    return { values: reviews.map(r => ({ ...r, reviewScore: convertEntityReviewScoreToDTO(r.score) })), totalCount }
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
    return { values: reviews.map(r => ({ ...r, reviewScore: convertEntityReviewScoreToDTO(r.score) })), totalCount }
  },

  async create(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in Request')
    }
    const { shopId } = query
    const { text, score } = await upsertSchema.parseAsync(query.params)
    await ReviewService.insertReview(user, shopId, text, convertReviewScoreToEntity(score))
    return 'Review created'
  },

  async update(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, reviewId } = query
    const { text, score } = await upsertSchema.parseAsync(query.params)
    await ReviewService.updateReview(user, shopId, reviewId, text, convertReviewScoreToEntity(score))
    return 'Review updated'
  },

  async delete(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, reviewId } = query
    await ReviewService.deleteReview(user, shopId, reviewId)
    return 'Review deleted'
  },

}

export default ReviewController
