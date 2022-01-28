import { Tag } from '@entities/Tag'
import { TagServiceInterface } from '@shop/ShopController'
import TagRepository from '@shop/repositories/TagRepository'

export type TagRepositoryInterface = {
  fetchBySlugs(slugs: string[]): Promise<Tag[]>
  createTags(slugs: string[]): Promise<Tag[]>
  fetchShopTags(shopId: number): Promise<Tag[]>
  setShopTags(shopId: number, ids: number[]): Promise<void>
  unsetShopTags(shopId: number, ids: number[]): Promise<void>
}

const TagService: TagServiceInterface = {
  async setShopTags(shopId, slugs) {
    const existingTags = await TagRepository.fetchBySlugs(slugs)
    const newTags = slugs.filter(s => existingTags.findIndex(et => et.slug === s) === -1)
    const tagIds: number[] = []
    if (newTags.length > 0) {
      tagIds.push(...(await TagRepository.createTags(newTags)).map(nt => nt.id))
    }
    tagIds.push(...existingTags.map(et => et.id))

    const currentTagIds = (await TagRepository.fetchShopTags(shopId)).map(st => st.id)
    const tagIdsToLink = tagIds.filter(ti => currentTagIds.indexOf(ti) === -1)
    const tagIdsToUnlink = currentTagIds.filter(cti => tagIds.indexOf(cti) === -1)

    await TagRepository.setShopTags(shopId, tagIdsToLink)
    await TagRepository.unsetShopTags(shopId, tagIdsToUnlink)
  },

  async fetchShopTags(shopId) {
    return TagRepository.fetchShopTags(shopId)
  },
}

export default TagService
