import { OrderBy } from '@entities/Common'
import { Review } from '@entities/Review'
import { User } from '@entities/User'
import { ReviewServiceInterface } from '@client/review/ReviewController'
import { NotFoundError } from '@errors/ServiceErrors'
import ReviewRepository from '@client/review/repositories/ReviewRepository'
import ShopRepository from '@client/review/repositories/ShopRepository'
import UserRepository from '@client/review/repositories/UserRepository'

export type ReviewRepositoryInterface = {
  fetchShopReviews(shopId: number, page: number, order: OrderBy, take: number): Promise<Review[]>
  fetchShopReviewsTotalCount(shopId: number): Promise<number>
  fetchShopReview(reviewId: number): Promise<Review>
}

export type ShopRepositoryInterface = {
  fetchShopName(shopId: number): Promise<string | null>
}

export type UserRepositoryInterface = {
  fetchUsers(userIds: number[]): Promise<User[]>
  fetchUserById(userId: number): Promise<User | null>
}

const ReviewService: ReviewServiceInterface = {
  async fetchReviewsWithTotalCountAndShopNameAndClientName(user, shopId, page = 1, order = OrderBy.DESC, take = 10) {
    const shopName = await ShopRepository.fetchShopName(shopId)
    if (!shopName) {
      throw new NotFoundError('Shop does not exist')
    }

    const reviews = await ReviewRepository.fetchShopReviews(shopId, page, order, take)
    const totalCount = await ReviewRepository.fetchShopReviewsTotalCount(shopId)
    const clients = await UserRepository.fetchUsers(reviews.map(r => r.clientId))

    return {
      reviews: reviews.map(r => {
        const client = clients.find(cn => cn.id === r.clientId)!
        const fullName = `${client.lastNameKanji} ${client.firstNameKanji}`
        return {
          ...r,
          shopName,
          clientName: fullName,
        }
      }),
      totalCount,
    }
  },

  async fetchReviewWithShopNameAndClientName(user, shopId, reviewId) {
    const shopName = await ShopRepository.fetchShopName(shopId)
    if (!shopName) {
      throw new NotFoundError('Shop does not exist')
    }
    const review = await ReviewRepository.fetchShopReview(shopId, reviewId)
    if (!review) {
      throw new NotFoundError('Review does not exist')
    }
    const client = await UserRepository.fetchUserById(review.clientId)
    if (!client) {
      throw new NotFoundError('Client does not exist')
    }
    return {
      id: review.id,
      text: review.text,
      score: review.score,
      clientId: review.clientId,
      clientName: `${client.lastNameKana} ${client.firstNameKana}`,
      shopId: review.shopId,
      shopName,
    }
  },

}

export default ReviewService
