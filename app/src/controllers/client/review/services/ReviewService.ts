import { OrderBy } from '@entities/Common'
import { Review } from '@entities/Review'
import { User } from '@entities/User'
import Logger from '@lib/Logger'
import { ReviewServiceInterface } from '@client/review/ReviewController'
import { NotFoundError } from '@errors/ServiceErrors'
import ReviewRepository from '@client/review/repositories/ReviewRepository'
import ShopRepository from '@client/review/repositories/ShopRepository'
import UserRepository from '@client/review/repositories/UserRepository'

export type ReviewRepositoryInterface = {
  fetchShopReviews(shopId: number, page: number, order: OrderBy, take: number): Promise<Review[]>
  fetchShopReviewsTotalCount(shopId: number): Promise<number>
}

export type ShopRepositoryInterface = {
  fetchShopName(shopId: number): Promise<string | null>
}

export type UserRepositoryInterface = {
  fetchUsers(userIds: number[]): Promise<User[]>
}

const ReviewService: ReviewServiceInterface = {
  async fetchReviewsWithTotalCountAndShopNameAndClientName(user, shopId, page = 1, order = OrderBy.DESC, take = 10) {
    const shopName = await ShopRepository.fetchShopName(shopId)
    if (!shopName) {
      Logger.debug('Shop does not exist')
      throw new NotFoundError()
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

}

export default ReviewService
