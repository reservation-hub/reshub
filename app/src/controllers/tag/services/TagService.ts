import { OrderBy } from '@entities/Common'
import { Tag } from '@entities/Tag'
import { TagServiceInterface } from '@tag/TagController'
import { AuthorizationError, DuplicateModelError, NotFoundError } from '@errors/ServiceErrors'
import TagRepository from '@tag/repositories/TagRepository'
import ShopRepository from '@tag/repositories/ShopRepository'
import { RoleSlug } from '@entities/Role'

export type TagRepositoryInterface = {
  fetchAllTags(page: number, order: OrderBy, take: number): Promise<Tag[]>
  fetchTagsTotalCount(): Promise<number>
  fetchAllShopTags(shopId: number, page: number, order: OrderBy, take: number): Promise<Tag[]>
  fetchShopTagsTotalCount(shopId: number): Promise<number>
  fetchTag(id: number): Promise<Tag | null>
  fetchTagBySlug(slug: string): Promise<Tag | null>
  insertTag(slug: string): Promise<Tag>
  updateTag(id: number, slug: string): Promise<Tag>
  deleteTag(id: number): Promise<Tag>
  searchTag(keyword: string, page: number, order: OrderBy, take: number): Promise<Tag[]>
  searchTagTotalCount(keyword: string): Promise<number>
  setShopTags(shopId: number, tagIds: number[]): Promise<void>
  fetchTagIdsNotLinkedYet(shopId: number, tagIds: number[]): Promise<number[]>
}

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const TagService: TagServiceInterface = {
  async fetchTagsWithTotalCount(page = 1, order = OrderBy.DESC, take = 10) {
    const tags = await TagRepository.fetchAllTags(page, order, take)
    const totalCount = await TagRepository.fetchTagsTotalCount()
    return { tags, totalCount }
  },

  async fetchShopTagsWithTotalCount(user, shopId, page = 1, order = OrderBy.DESC, take = 10) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }
    const tags = await TagRepository.fetchAllShopTags(shopId, page, order, take)
    const totalCount = await TagRepository.fetchShopTagsTotalCount(shopId)
    return { tags, totalCount }
  },

  async fetchTag(id) {
    const tag = await TagRepository.fetchTag(id)
    if (!tag) {
      throw new NotFoundError('No tag found')
    }
    return tag
  },

  async insertTag(slug) {
    const duplicateSlug = await TagRepository.fetchTagBySlug(slug)
    if (duplicateSlug) {
      throw new DuplicateModelError('Duplicate slug found')
    }
    return TagRepository.insertTag(slug)
  },

  async updateTag(id, slug) {
    const tag = await TagRepository.fetchTag(id)
    if (!tag) {
      throw new NotFoundError('No tag found')
    }

    const duplicateSlug = await TagRepository.fetchTagBySlug(slug)
    if (duplicateSlug && duplicateSlug.id !== tag.id) {
      throw new DuplicateModelError('Duplicate slug found')
    }

    return TagRepository.updateTag(id, slug)
  },

  async deleteTag(id) {
    const tag = await TagRepository.fetchTag(id)
    if (!tag) {
      throw new NotFoundError('No tag found')
    }
    return TagRepository.deleteTag(id)
  },

  async searchTag(keyword, page = 1, order = OrderBy.DESC, take = 10) {
    const tags = await TagRepository.searchTag(keyword, page, order, take)
    const totalCount = await TagRepository.searchTagTotalCount(keyword)
    return { tags, totalCount }
  },

  async setShopTags(user, shopId, tagIds) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }
    const uniqueTagIds: number[] = tagIds.filter((n, i) => tagIds.indexOf(n) === i)
    const tagIdsToLink = await TagRepository.fetchTagIdsNotLinkedYet(shopId, uniqueTagIds)
    await TagRepository.setShopTags(shopId, tagIdsToLink)
  },
}

export default TagService
