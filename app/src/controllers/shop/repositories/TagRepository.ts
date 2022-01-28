import { Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@entities/Tag'
import { TagRepositoryInterface } from '@shop/services/TagService'
import prisma from '@lib/prisma'

const convertToEntitySlug = (tag: PrismaTag): Tag => ({ id: tag.id, slug: tag.slug })

const TagRepository: TagRepositoryInterface = {
  async fetchBySlugs(slugs) {
    const tags = await prisma.tag.findMany({
      where: { slug: { in: slugs } },
    })
    return tags.map(convertToEntitySlug)
  },

  async createTags(slugs) {
    const tags = await Promise.all(slugs.map(async slug => prisma.tag.create({
      data: { slug },
    })))
    return tags.map(convertToEntitySlug)
  },

  async fetchShopTags(shopId) {
    const shopTags = await prisma.shopTags.findMany({
      where: { shopId },
      include: { tag: true },
    })
    return shopTags.map(st => convertToEntitySlug(st.tag))
  },

  async setShopTags(shopId, ids) {
    await prisma.shopTags.createMany({
      data: ids.map(id => ({ shopId, tagId: id })),
    })
  },

  async unsetShopTags(shopId, ids) {
    await prisma.shopTags.deleteMany({
      where: { shopId, AND: { tagId: { in: ids } } },
    })
  },
}

export default TagRepository
