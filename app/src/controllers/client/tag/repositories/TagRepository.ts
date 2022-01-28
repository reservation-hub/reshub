import { Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@entities/Tag'
import prisma from '@lib/prisma'
import { TagRepositoryInterface } from '@client/tag/services/TagService'

const convertToEntityTag = (tag: PrismaTag): Tag => ({ id: tag.id, slug: tag.slug })

const TagRepository: TagRepositoryInterface = {
  async searchTag(keyword, page, order) {
    const limit = 10
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const tags = await prisma.tag.findMany({
      where: { slug: { contains: keyword } },
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
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
