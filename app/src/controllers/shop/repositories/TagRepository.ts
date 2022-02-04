import { Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@entities/Tag'
import { TagRepositoryInterface } from '@shop/services/TagService'
import prisma from '@lib/prisma'

const convertToEntityTag = (tag: PrismaTag): Tag => ({ id: tag.id, slug: tag.slug })

const TagRepository: TagRepositoryInterface = {
  async fetchShopTags(shopId) {
    const shopTags = await prisma.shopTags.findMany({
      where: { shopId },
      include: { tag: true },
    })
    return shopTags.map(st => convertToEntityTag(st.tag))
  },
}

export default TagRepository
