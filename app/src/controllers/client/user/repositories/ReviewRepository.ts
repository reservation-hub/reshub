import { ReviewRepositoryInterface } from '@client/user/services/UserService'
import prisma from '@lib/prisma'

const ReviewRepository: ReviewRepositoryInterface = {
  async fetchUserReviewCount(userId) {
    return prisma.review.count({ where: { userId } })
  },
}

export default ReviewRepository
