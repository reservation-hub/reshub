import { Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@entities/Tag'
import prisma from '@lib/prisma'
import { TagRepositoryInterface } from '@client/shop/services/ShopService'

const convertToEntityTag = (tag: PrismaTag): Tag => ({ id: tag.id, slug: tag.slug })

const TagRepository: TagRepositoryInterface = {
  async fetchValidTagsBySlugs(slugs) {
    const tags = await prisma.tag.findMany({
      where: { slug: { in: slugs } },
    })
    return tags.map(convertToEntityTag)
  },
}

export default TagRepository
