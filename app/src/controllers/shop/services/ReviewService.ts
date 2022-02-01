import { Review } from '@entities/Review'
import { ReviewsServiceInterface } from '@shop/ShopController'
import ReviewRepository from '@shop/repositories/ReviewRepository'

export type ReviewRepositoryInterface = {
    fetchReviewsForShop(shopId: number, limit: number): Promise<Review[]>
}

const ReviewService: ReviewsServiceInterface = {
  async fetchReviewsForShop(shopId, limit = 10) {
    return ReviewRepository.fetchReviewsForShop(shopId, limit)
  },
}

export default ReviewService
