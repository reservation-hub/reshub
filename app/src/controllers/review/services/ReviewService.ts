import { OrderBy } from '@entities/Common'
import { Review, ReviewScore } from '@entities/Review'
import { RoleSlug } from '@entities/Role'
import { User } from '@entities/User'
import { ReviewServiceInterface } from '@review/ReviewController'
import { AuthorizationError, NotFoundError } from '@errors/ServiceErrors'
import ReviewRepository from '@review/repositories/ReviewRepository'
import ShopRepository from '@review/repositories/ShopRepository'
import UserRepository from '@review/repositories/UserRepository'

export type ReviewRepositoryInterface = {
  fetchShopReviews(shopId: number, page: number, order: OrderBy, take: number): Promise<Review[]>
  fetchShopReviewsTotalCount(shopId: number): Promise<number>
  fetchShopReview(shopId: number, reviewId: number): Promise<Review | null>
  updateReview(userId:number, shopId: number, reviewId: number, text: string, score: ReviewScore): Promise<Review>
}

export type ShopRepositoryInterface = {
  fetchShopName(shopId: number): Promise<string | null>
  fetchUserShopIds(userId: number): Promise<number[]>
}

export type UserRepositoryInterface = {
  fetchUsers(userIds: number[]): Promise<User[]>
  fetchUser(userId: number): Promise<User | null>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const ReviewService: ReviewServiceInterface = {
  async fetchReviewsWithTotalCountAndShopNameAndClientName(user, shopId, page = 1, order = OrderBy.DESC, take = 10) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }
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
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const shopName = await ShopRepository.fetchShopName(shopId)
    if (!shopName) {
      throw new NotFoundError('Shop does not exist')
    }

    const review = await ReviewRepository.fetchShopReview(shopId, reviewId)
    if (!review) {
      throw new NotFoundError('Review does not exist')
    }

    const client = await UserRepository.fetchUser(review.clientId)
    if (!client) {
      throw new NotFoundError('Client does not exist')
    }

    return {
      ...review,
      shopName,
      clientName: `${client.lastNameKanji} ${client.firstNameKanji}`,
    }
  },
}

export default ReviewService
