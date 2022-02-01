import { ReviewServiceInterface } from '@client/shop/ShopController'
import { Review } from '@entities/Review'
import ReviewRepository from '@client/shop/repositories/ReviewRepository'
import UserRepository from '@client/shop/repositories/UserRepository'

export type ReviewRepositoryInterface = {
  fetchShopReviews(shopId: number, take: number): Promise<Review[]>
  fetchShopReviewsCounts(shopIds: number[]): Promise<{ shopId: number, reviewCount: number }[]>
}

export type UserRepositoryInterface = {
  fetchUserNames(userIds: number[]): Promise<{ userId: number, lastNameKanji: string, firstNameKanji: string }[]>
}

const ReviewService: ReviewServiceInterface = {
  async fetchShopReviewsWithClientName(shopId) {
    const take = 3
    const reviews = await ReviewRepository.fetchShopReviews(shopId, take)
    const clientNames = await UserRepository.fetchUserNames(reviews.map(r => r.clientId))

    return reviews.map(r => {
      const client = clientNames.find(cn => cn.userId === r.clientId)!
      const clientName = `${client.lastNameKanji} ${client.firstNameKanji}`
      return { ...r, clientName }
    })
  },

  async fetchShopsReviewsCount(shopIds) {
    const reviewCounts = await ReviewRepository.fetchShopReviewsCounts(shopIds)
    return shopIds.map(shopId => ({
      shopId,
      reviewCount: reviewCounts.find(rc => rc.shopId === shopId)?.reviewCount ?? 0,
    }))
  },
}

export default ReviewService
