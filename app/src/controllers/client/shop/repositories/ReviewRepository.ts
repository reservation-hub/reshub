import { ReviewRepositoryInterface } from '@client/shop/services/ReviewService'
import prisma from '@lib/prisma'
import { reconstructReview } from '@prismaConverters/Review'

const ReviewRepository: ReviewRepositoryInterface = {
  async fetchShopReviews(shopId, take) {
    const reviews = await prisma.review.findMany({
      where: { shopId },
      take,
    })
    return reviews.map(reconstructReview)
  },

  async fetchShopReviewsCounts(shopIds) {
    const reviews = await prisma.review.groupBy({
      by: ['shopId'],
      where: { shopId: { in: shopIds } },
      _count: true,
    })

    return reviews.map(r => ({
      shopId: r.shopId,
      reviewCount: r._count,
    }))
  },
}

export default ReviewRepository
