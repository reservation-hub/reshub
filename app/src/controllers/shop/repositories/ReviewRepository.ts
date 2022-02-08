import { ReviewRepositoryInterface } from '@shop/services/ReviewService'
import prisma from '@lib/prisma'
import { reconstructReview } from '@prismaConverters/Review'

const ReviewRepository: ReviewRepositoryInterface = {

  async fetchReviewsForShop(shopId, limit) {
    const reviews = await prisma.review.findMany({
      where: { shopId },
      take: limit,
    })
    return reviews.map(reconstructReview)
  },
}

export default ReviewRepository
