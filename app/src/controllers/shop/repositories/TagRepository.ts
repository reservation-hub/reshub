import { TagRepositoryInterface } from '@shop/services/TagService'
import prisma from '@lib/prisma'
import { convertToEntityTag } from '@prismaConverters/Tag'

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
