import { ReviewRepositoryInterface } from '@review/services/ReviewService'
import prisma from '@lib/prisma'
import { convertEntityOrderToRepositoryOrder } from '@prismaConverters/Common'
import { convertEntityToReviewScore, reconstructReview } from '@prismaConverters/Review'

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
