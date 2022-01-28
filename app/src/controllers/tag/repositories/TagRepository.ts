import { Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@entities/Tag'
import prisma from '@lib/prisma'
import { TagRepositoryInterface } from '@tag/services/TagService'

const convertToEntityTag = (tag: PrismaTag): Tag => ({ id: tag.id, slug: tag.slug })

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

  async fetchTag(id) {
    const tag = await prisma.tag.findUnique({
      where: { id },
    })
    return tag ? convertToEntityTag(tag) : null
  },
}

export default TagRepository
