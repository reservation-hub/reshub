import { TagControllerInterface as TagEndpointSocket } from '@controller-adapter/Tag'
import { TagControllerInterface as ShopEndpointSocket } from '@controller-adapter/Shop'
import { Tag } from '@entities/Tag'
import { OrderBy } from '@request-response-types/Common'
import { OrderBy as EntityOrderBy } from '@entities/Common'
import TagService from '@tag/services/TagService'
import {
  indexSchema, searchSchema, tagLinkSchema, tagUpsertSchema,
} from '@tag/schemas'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { UserForAuth } from '@entities/User'

export type TagServiceInterface = {
  fetchTagsWithTotalCount(page?: number, order?: OrderBy, take?: number)
    : Promise<{ tags: Tag[], totalCount: number }>
  fetchShopTagsWithTotalCount(user: UserForAuth, shopId: number, page?: number, order?: OrderBy, take?: number)
    : Promise<{ tags: Tag[], totalCount: number }>
  fetchTag(id: number): Promise<Tag>
  insertTag(slug: string): Promise<Tag>
  updateTag(id: number, slug: string): Promise<Tag>
  deleteTag(id: number): Promise<Tag>
  searchTag(keyword: string, page?: number, order?: OrderBy, take?: number)
    : Promise<{ tags: Tag[], totalCount: number }>
  setShopTags(user: UserForAuth, shopId: number, tagIds: number[]): Promise<void>
}

const convertOrderByToEntity = (order: OrderBy): EntityOrderBy => {
  switch (order) {
    case OrderBy.ASC:
      return EntityOrderBy.ASC
    default:
      return EntityOrderBy.DESC
  }
}

const TagController: TagEndpointSocket & ShopEndpointSocket = {
  async index(query) {
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { tags, totalCount } = await TagService.fetchTagsWithTotalCount(
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    return { values: tags, totalCount }
  },

  async show(query) {
    const { id } = query
    return TagService.fetchTag(id)
  },

  async insert(query) {
    const { slug } = await tagUpsertSchema.parseAsync(query)
    await TagService.insertTag(slug)
    return 'Tag created'
  },

  async update(query) {
    const { id, params } = query
    const { slug } = await tagUpsertSchema.parseAsync(params)
    await TagService.updateTag(id, slug)
    return 'Tag updated'
  },

  async delete(query) {
    const { id } = query
    await TagService.deleteTag(id)
    return 'Tag deleted'
  },

  async search(query) {
    const {
      keyword, page, order, take,
    } = await searchSchema.parseAsync(query)
    const { tags: values, totalCount } = await TagService.searchTag(keyword, page, order, take)
    return { values, totalCount }
  },

  async getShopTags(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId } = query
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { tags, totalCount } = await TagService.fetchShopTagsWithTotalCount(
      user, shopId, page, order, take,
    )
    return { values: tags, totalCount }
  },

  async linkTagsToShop(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId } = query
    const { tagIds } = await tagLinkSchema.parseAsync(query.params)
    await TagService.setShopTags(user, shopId, tagIds)

    return 'Tags linked to shop'
  },

}

export default TagController
