import { OrderBy } from '@entities/Common'
import { Review, ReviewScore } from '@entities/Review'
import { User } from '@entities/User'
import { ReviewServiceInterface } from '@client/review/ReviewController'
import { NotFoundError } from '@errors/ServiceErrors'
import ReviewRepository from '@client/review/repositories/ReviewRepository'
import ShopRepository from '@client/review/repositories/ShopRepository'
import UserRepository from '@client/review/repositories/UserRepository'
import { UnauthorizedError } from '@errors/RouteErrors'
import Logger from '@lib/Logger'

export type ReviewRepositoryInterface = {
  fetchShopReviews(shopId: number, page: number, order: OrderBy, take: number): Promise<Review[]>
  fetchUserReviews(userId: number, page: number, order: OrderBy, take: number): Promise<Review[]>
  fetchShopReviewsTotalCount(shopId: number): Promise<number>
  fetchUserReviewsTotalCount(userId: number): Promise<number>
  fetchReview(reviewId: number): Promise<Review | null>
  insertReview(userId: number, shopId: number, text: string, score: ReviewScore): Promise<Review>
  updateReview(userId: number, shopId: number, reviewId: number, text: string, score: ReviewScore):
    Promise<Review>
  deleteReview(reviewId: number): Promise<Review>
}

export type ShopRepositoryInterface = {
  fetchShopName(shopId: number): Promise<string | null>
  fetchShopNames(shopIds: number[]): Promise<{ shopId: number, shopName: string }[]>
}

export type UserRepositoryInterface = {
  fetchUser(userId: number): Promise<User | null>
  fetchUsers(userIds: number[]): Promise<User[]>
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

  async fetchUserReviewsWithTotalCountAndShopNameAndClientName(user, page = 1, order = OrderBy.DESC, take = 10) {
    const reviews = await ReviewRepository.fetchUserReviews(user.id, page, order, take)
    const totalCount = await ReviewRepository.fetchUserReviewsTotalCount(user.id)
    const userEntity = await UserRepository.fetchUser(user.id)
    const shopNames = await ShopRepository.fetchShopNames(reviews.map(r => r.shopId))

    if (!userEntity) {
      throw new NotFoundError('User not found')
    }

    return {
      reviews: reviews.map(r => ({
        ...r,
        shopName: shopNames.find(sn => sn.shopId === r.shopId)!.shopName,
        clientName: `${userEntity.lastNameKanji} ${userEntity.firstNameKanji}`,
      })),
      totalCount,
    }
  },

  async insertReview(user, shopId, text, score) {
    const shopName = await ShopRepository.fetchShopName(shopId)
    if (!shopName) {
      throw new NotFoundError('The shop you want to make review for does not exist')
    }
    return ReviewRepository.insertReview(user.id, shopId, text, score)
  },

  async updateReview(user, shopId, reviewId, text, score) {
    const review = await ReviewRepository.fetchReview(reviewId)
    if (!review) {
      throw new NotFoundError('Review not found')
    }
    if (review.clientId !== user.id) {
      throw new UnauthorizedError('This Review is not owned by the current user')
    }
    if (review.shopId !== shopId) {
      throw new UnauthorizedError('This Review is not of the shop')
    }
    return ReviewRepository.updateReview(user.id, shopId, reviewId, text, score)
  },

  async deleteReview(user, shopId, reviewId) {
    const review = await ReviewRepository.fetchReview(reviewId)
    if (!review) {
      throw new NotFoundError('The review does not exist')
    }
    if (review.clientId !== user.id) {
      throw new UnauthorizedError('Cannot delete Review does not belong to the user')
    }
    if (review.shopId !== shopId) {
      throw new UnauthorizedError('This Review is not of the shop')
    }
    return ReviewRepository.deleteReview(reviewId)
  },
}
export default ReviewService
