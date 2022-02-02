import { OrderBy } from '@entities/Common'
import { Tag } from '@entities/Tag'
import { TagServiceInterface } from '@tag/TagController'
import TagRepository from '@tag/repositories/TagRepository'
import { DuplicateModelError, NotFoundError } from '@errors/ServiceErrors'

export type TagRepositoryInterface = {
  fetchAllTags(page: number, order: OrderBy, take: number): Promise<Tag[]>
  fetchTagsTotalCount(): Promise<number>
  fetchTag(id: number): Promise<Tag | null>
  fetchTagBySlug(slug: string): Promise<Tag | null>
  insertTag(slug: string): Promise<Tag>
  updateTag(id: number, slug: string): Promise<Tag>
  deleteTag(id: number): Promise<Tag>
  searchTag(keyword: string, page: number, order: OrderBy, take: number): Promise<Tag[]>
  searchTagTotalCount(keyword: string): Promise<number>
}

const TagService: TagServiceInterface = {
  async fetchTagsWithTotalCount(page = 1, order = OrderBy.DESC, take = 10) {
    const tags = await TagRepository.fetchAllTags(page, order, take)
    const totalCount = await TagRepository.fetchTagsTotalCount()
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
}

export default TagService
