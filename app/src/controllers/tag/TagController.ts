import { TagControllerInterface } from '@controller-adapter/Tag'
import { Tag } from '@entities/Tag'
import { OrderBy } from '@request-response-types/Common'
import TagService from '@tag/services/TagService'
import { indexSchema, tagUpsertSchema } from '@tag/schemas'

export type TagServiceInterface = {
  fetchTagsWithTotalCount(page?: number, order?: OrderBy): Promise<{ tags: Tag[], totalCount: number }>
  fetchTag(id: number): Promise<Tag>
  insertTag(slug: string): Promise<Tag>
  updateTag(id: number, slug: string): Promise<Tag>
  deleteTag(id: number): Promise<Tag>
  searchTag(keyword: string, page?: number, order?: OrderBy): Promise<{ tags: Tag[], totalCount: number }>
}

const TagController: TagControllerInterface = {
  async index(query) {
    const { page, order } = await indexSchema.parseAsync(query)
    const { tags, totalCount } = await TagService.fetchTagsWithTotalCount(page, order)
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
    const { keyword, page, order } = query
    const { tags: values, totalCount } = await TagService.searchTag(keyword, page, order)
    return { values, totalCount }
  },
}

export default TagController
