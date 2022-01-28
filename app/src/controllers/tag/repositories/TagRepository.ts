import prisma from '@lib/prisma'
import { TagRepositoryInterface } from '@tag/services/TagService'

const TagRepository: TagRepositoryInterface = {
  async fetchAllTags(page, order) {
    const limit = 10
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    return prisma.tag.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })
  },

  async fetchTagsTotalCount() {
    return prisma.tag.count()
  },
}

export default TagRepository
