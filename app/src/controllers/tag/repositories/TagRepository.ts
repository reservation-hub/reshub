import { Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@entities/Tag'
import prisma from '@lib/prisma'
import { TagRepositoryInterface } from '@tag/services/TagService'

const convertToEntityTag = (tag: PrismaTag): Tag => ({ id: tag.id, slug: tag.slug })

const TagRepository: TagRepositoryInterface = {
  async fetchAllTags(page, order) {
    const limit = 10
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const tags = await prisma.tag.findMany({
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })
    return tags.map(convertToEntityTag)
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
