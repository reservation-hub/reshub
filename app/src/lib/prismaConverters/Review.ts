import { ReviewScore, Review as EntityReview } from '@entities/Review'
import { Review } from '@prisma/client'

export const convertReviewScoreToEntity = (score: number): ReviewScore => {
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

export const convertEntityToReviewScore = (score: ReviewScore): number => {
  switch (score) {
    case ReviewScore.one:
      return 1
    case ReviewScore.two:
      return 2
    case ReviewScore.three:
      return 3
    case ReviewScore.four:
      return 4
    default:
      return 5
  }
}

export const reconstructReview = (review: Review): EntityReview => ({
  id: review.id,
  text: review.text,
  shopId: review.shopId,
  score: convertReviewScoreToEntity(review.score),
  clientId: review.userId,
})
