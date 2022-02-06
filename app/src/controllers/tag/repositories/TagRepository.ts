import { OrderBy } from '@entities/Common'
import { Prisma, Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@entities/Tag'
import prisma from '@lib/prisma'
import { TagRepositoryInterface } from '@tag/services/TagService'

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
  async fetchAllTags(page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const tags = await prisma.tag.findMany({
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
    })
    return tags.map(convertToEntityTag)
  },

  async fetchTagsTotalCount() {
    return prisma.tag.count()
  },

  async fetchAllShopTags(shopId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const shopTags = await prisma.shopTags.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
      include: { tag: true },
    })
    return shopTags.map(st => convertToEntityTag(st.tag))
  },

  async fetchShopTagsTotalCount(shopId) {
    return prisma.shopTags.count({ where: { shopId } })
  },

  async fetchTag(id) {
    const tag = await prisma.tag.findUnique({
      where: { id },
    })
    return tag ? convertToEntityTag(tag) : null
  },

  async fetchTagBySlug(slug) {
    const tag = await prisma.tag.findUnique({
      where: { slug },
    })
    return tag ? convertToEntityTag(tag) : null
  },

  async insertTag(slug) {
    const tag = await prisma.tag.create({
      data: { slug },
    })
    return convertToEntityTag(tag)
  },

  async updateTag(id, slug) {
    const tag = await prisma.tag.update({
      where: { id },
      data: { slug },
    })
    return convertToEntityTag(tag)
  },

  async deleteTag(id) {
    const tag = await prisma.tag.delete({
      where: { id },
    })
    return convertToEntityTag(tag)
  },

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

  async setShopTags(shopId, ids) {
    await prisma.shopTags.createMany({
      data: ids.map(id => ({ shopId, tagId: id })),
    })
    const tags = await prisma.tag.findMany({
      where: { id: { in: ids } },
    })
    return tags.map(convertToEntityTag)
  },

  async fetchTagIdsNotLinkedYet(shopId, tagIds) {
    const shopTags = await prisma.shopTags.findMany({
      where: { tagId: { in: tagIds }, AND: { shopId } },
    })
    return tagIds.filter(ti => !shopTags.some(st => st.tagId === ti))
  },

}

export default TagRepository
