import { OrderBy } from '@entities/Common'
import { Tag } from '@entities/Tag'
import { TagServiceInterface } from '@tag/TagController'
import TagRepository from '@tag/repositories/TagRepository'
import Logger from '@lib/Logger'
import { NotFoundError } from '@errors/ServiceErrors'

export type TagRepositoryInterface = {
  fetchAllTags(page: number, order: OrderBy): Promise<Tag[]>
  fetchTagsTotalCount(): Promise<number>
  fetchTag(id: number): Promise<Tag | null>
}

const TagService: TagServiceInterface = {
  async fetchTagsWithTotalCount(page = 1, order = OrderBy.DESC) {
    const tags = await TagRepository.fetchAllTags(page, order)
    const totalCount = await TagRepository.fetchTagsTotalCount()
    return { tags, totalCount }
  },

  async fetchTag(id) {
    const tag = await TagRepository.fetchTag(id)
    if (!tag) {
      Logger.debug('No tag found')
      throw new NotFoundError()
    }
    return tag
  },
}

export default TagService
