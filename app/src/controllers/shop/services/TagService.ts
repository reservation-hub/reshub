import { Tag } from '@entities/Tag'
import { TagServiceInterface } from '@shop/ShopController'
import TagRepository from '@shop/repositories/TagRepository'

export type TagRepositoryInterface = {
  fetchShopTags(shopId: number): Promise<Tag[]>
}

const TagService: TagServiceInterface = {
  async fetchShopTags(shopId) {
    return TagRepository.fetchShopTags(shopId)
  },
}

export default TagService
