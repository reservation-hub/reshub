import { Prisma, Tag as PrismaTag } from '@prisma/client'
import { OrderBy } from '@entities/Common'
import { Tag } from '@entities/Tag'
import prisma from '@lib/prisma'
import { TagRepositoryInterface } from '@client/tag/services/TagService'

const convertToEntityTag = (tag: PrismaTag): Tag => ({ id: tag.id, slug: tag.slug })

const convertEntityOrderToRepositoryOrder = (order: OrderBy): Prisma.SortOrder => {
  switch (order) {
    case OrderBy.ASC:
      return Prisma.SortOrder.asc
    default:
      return Prisma.SortOrder.desc
  }
}

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
