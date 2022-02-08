import prisma from '@lib/prisma'
import { TagRepositoryInterface } from '@client/tag/services/TagService'
import { convertEntityOrderToRepositoryOrder } from '@lib/prismaConverters/Common'
import { convertToEntityTag } from '@lib/prismaConverters/Tag'

const TagRepository: TagRepositoryInterface = {
  async searchTag(keyword, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const tags = await prisma.tag.findMany({
      where: { slug: { contains: keyword } },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
    })
    return tags.map(convertToEntityTag)
  },

  async searchTagTotalCount(keyword) {
    return prisma.tag.count({
      where: { slug: { contains: keyword } },
    })
  },
}

export default TagRepository
