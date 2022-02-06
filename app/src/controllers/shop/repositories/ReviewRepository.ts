import { ReviewRepositoryInterface } from '@shop/services/ReviewService'
import prisma from '@lib/prisma'
import { ReviewScore, Review as EntityReview } from '@entities/Review'
import { Review } from '@prisma/client'

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

  async fetchReviewsForShop(shopId, limit) {
    const reviews = await prisma.review.findMany({
      where: { shopId },
      take: limit,
    })
    return reviews.map(reconstructReview)
  },
}

export default ReviewRepository
