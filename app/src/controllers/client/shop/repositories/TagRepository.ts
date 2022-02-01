import { Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@entities/Tag'
import prisma from '@lib/prisma'
import { TagRepositoryInterface as ShopServiceSocket } from '@client/shop/services/ShopService'
import { TagRepositoryInterface as TagServiceSocket } from '@client/shop/services/TagService'

const convertToEntityTag = (tag: PrismaTag): Tag => ({ id: tag.id, slug: tag.slug })

const TagRepository: ShopServiceSocket & TagServiceSocket = {
  async fetchValidTagsBySlugs(slugs) {
    const tags = await prisma.tag.findMany({
      where: { slug: { in: slugs } },
    })
    return tags.map(convertToEntityTag)
  },

  async fetchShopsTags(shopIds) {
    const tags = await prisma.shopTags.findMany({
      where: { shopId: { in: shopIds } },
      include: { tag: true },
    })

    return shopIds.map(shopId => ({
      shopId,
      tags: tags.filter(t => (t.shopId === shopId)).map(t => convertToEntityTag(t.tag)),
    }))
  },
}

export default TagRepository
