import { ReviewRepositoryInterface } from '@shop/services/ReviewService'
import prisma from '@lib/prisma'
import { ReviewScore as EntityReviewScore, Review as EntityReview } from '@entities/Review'
import { ReviewScore, Review } from '@prisma/client'

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

  async fetchReviewsForShop(shopId, limit) {
    const reviews = await prisma.review.findMany({
      where: { shopId },
      take: limit,
    })
    return reviews.map(reconstructReview)
  },
}

export default ReviewRepository
