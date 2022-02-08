import { ReviewScore } from '@request-response-types/models/Review'
import { ReviewScore as EntityReviewScore } from '@entities/Review'

export const convertReviewScoreToEntity = (reviewScore: ReviewScore): EntityReviewScore => {
  switch (reviewScore) {
    case ReviewScore.one:
      return EntityReviewScore.one
    case ReviewScore.two:
      return EntityReviewScore.two
    case ReviewScore.three:
      return EntityReviewScore.three
    case ReviewScore.four:
      return EntityReviewScore.four
    default:
      return EntityReviewScore.five
  }
}

export const convertEntityReviewScoreToDTO = (reviewScore: EntityReviewScore): ReviewScore => {
  switch (reviewScore) {
    case EntityReviewScore.one:
      return ReviewScore.one
    case EntityReviewScore.two:
      return ReviewScore.two
    case EntityReviewScore.three:
      return ReviewScore.three
    case EntityReviewScore.four:
      return ReviewScore.four
    default:
      return ReviewScore.five
  }
}
