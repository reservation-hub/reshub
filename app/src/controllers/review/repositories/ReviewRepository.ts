import { ReviewScore } from '@prisma/client'
import { ReviewScore as EntityReviewScore } from '@entities/Review'
import { ReviewRepositoryInterface } from '@review/services/ReviewService'
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

const ReviewRepository: ReviewRepositoryInterface = {
  async fetchShopReviews(shopId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const reviews = await prisma.review.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: order },
      take,
    })

    return reviews.map(r => ({
      ...r,
      score: convertReviewScoreToEntity(r.score),
      clientId: r.userId,
    }))
  },

  async fetchShopReviewsTotalCount(shopId) {
    return prisma.review.count({ where: { shopId } })
  },
}

export default ReviewRepository
