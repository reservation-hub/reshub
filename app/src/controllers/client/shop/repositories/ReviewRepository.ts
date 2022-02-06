import { Review } from '@prisma/client'
import { ReviewScore, Review as EntityReview } from '@entities/Review'
import { ReviewRepositoryInterface } from '@client/shop/services/ReviewService'
import prisma from '@lib/prisma'

const convertReviewScoreToEntity = (score: number): ReviewScore => {
  switch (score) {
    case 1:
      return ReviewScore.one
    case 2:
      return ReviewScore.two
    case 3:
      return ReviewScore.three
    case 4:
      return ReviewScore.four
    default:
      return ReviewScore.five
  }
}

const reconstructReview = (review: Review): EntityReview => ({
  id: review.id,
  text: review.text,
  shopId: review.shopId,
  score: convertReviewScoreToEntity(review.score),
  clientId: review.userId,
})

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
