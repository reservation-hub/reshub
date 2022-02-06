import { Review, Prisma } from '@prisma/client'
import { ReviewScore, Review as EntityReview } from '@entities/Review'
import { ReviewRepositoryInterface } from '@review/services/ReviewService'
import { OrderBy } from '@entities/Common'
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

const convertEntityToReviewScore = (score: ReviewScore): number => {
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

const convertEntityOrderToRepositoryOrder = (order: OrderBy): Prisma.SortOrder => {
  switch (order) {
    case OrderBy.ASC:
      return Prisma.SortOrder.asc
    default:
      return Prisma.SortOrder.desc
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
  async fetchShopReviews(shopId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const reviews = await prisma.review.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
    })

    return reviews.map(reconstructReview)
  },

  async fetchShopReviewsTotalCount(shopId) {
    return prisma.review.count({ where: { shopId } })
  },

  async fetchShopReview(shopId, reviewId) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, AND: { shopId } },
    })
    return review ? reconstructReview(review) : null
  },

  async updateReview(userId, shopId, reviewId, text, score) {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        userId,
        shopId,
        text,
        score: convertEntityToReviewScore(score),
      },
    })
    return reconstructReview(updatedReview)
  },
  async insertReview(userId, shopId, text, score) {
    const review = await prisma.review.create({
      data: {
        shopId,
        text,
        userId,
        score: convertEntityToReviewScore(score),
      },
    })
    return reconstructReview(review)
  },

  async deleteReview(reviewId) {
    const review = await prisma.review.delete({
      where: { id: reviewId },
    })
    return reconstructReview(review)
  },
}

export default ReviewRepository
