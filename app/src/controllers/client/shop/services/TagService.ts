import { TagServiceInterface } from '@client/shop/ShopController'
import { Tag } from '@entities/Tag'
import TagRepository from '@client/shop/repositories/TagRepository'

export type TagRepositoryInterface = {
  fetchShopsTags(shopIds: number[]): Promise<{ shopId: number, tags: Tag[]}[]>
}

const TagService: TagServiceInterface = {
  async fetchShopsTags(shopIds) {
    const shopTags = await TagRepository.fetchShopsTags(shopIds)
    return shopIds.map(shopId => ({
      shopId,
      tags: shopTags.find(st => st.shopId === shopId)?.tags ?? [],
    }))
  },
}

export default TagService
