import { ReviewScore, Review } from '@prisma/client'
import { ReviewScore as EntityReviewScore, Review as EntityReview } from '@entities/Review'
import { ReviewRepositoryInterface } from '@client/shop/services/ReviewService'
import prisma from '@lib/prisma'

const convertReviewScoreToEntity = (score: ReviewScore): EntityReviewScore => {
  switch (score) {
    case ReviewScore.ONE:
      return EntityReviewScore.one
    case ReviewScore.TWO:
      return EntityReviewScore.two
    case ReviewScore.THREE:
      return EntityReviewScore.three
    case ReviewScore.FOUR:
      return EntityReviewScore.four
    default:
      return EntityReviewScore.five
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
