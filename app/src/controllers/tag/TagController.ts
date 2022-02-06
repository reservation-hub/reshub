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
  fetchTagsWithTotalCount(page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ tags: Tag[], totalCount: number }>
  fetchShopTagsWithTotalCount(user: UserForAuth, shopId: number, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ tags: Tag[], totalCount: number }>
  fetchTag(id: number): Promise<Tag>
  insertTag(slug: string): Promise<Tag>
  updateTag(id: number, slug: string): Promise<Tag>
  deleteTag(id: number): Promise<Tag>
  searchTag(keyword: string, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ tags: Tag[], totalCount: number }>
  setShopTags(user: UserForAuth, shopId: number, tagIds: number[]): Promise<Tag[]>
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
    return TagService.insertTag(slug)
  },

  async update(query) {
    const { id, params } = query
    const { slug } = await tagUpsertSchema.parseAsync(params)
    return TagService.updateTag(id, slug)
  },

  async delete(query) {
    const { id } = query
    return TagService.deleteTag(id)
  },

  async search(query) {
    const {
      keyword, page, order, take,
    } = await searchSchema.parseAsync(query)
    const { tags: values, totalCount } = await TagService.searchTag(
      keyword,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    return { values, totalCount }
  },

  async getShopTags(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId } = query
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { tags, totalCount } = await TagService.fetchShopTagsWithTotalCount(
      user,
      shopId,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    return { values: tags, totalCount }
  },

  async linkTagsToShop(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId } = query
    const { tagIds } = await tagLinkSchema.parseAsync(query.params)
    return TagService.setShopTags(user, shopId, tagIds)
  },

}

export default TagController
