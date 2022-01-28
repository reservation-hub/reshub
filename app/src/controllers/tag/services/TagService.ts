import { OrderBy } from '@entities/Common'
import { Tag } from '@entities/Tag'
import { TagServiceInterface } from '@tag/TagController'
import TagRepository from '@tag/repositories/TagRepository'

export type TagRepositoryInterface = {
  fetchAllTags(page: number, order: OrderBy): Promise<Tag[]>
  fetchTagsTotalCount(): Promise<number>
}

const TagService: TagServiceInterface = {
  async fetchTagsWithTotalCount(page = 1, order = OrderBy.DESC) {
    const tags = await TagRepository.fetchAllTags(page, order)
    const totalCount = await TagRepository.fetchTagsTotalCount()
    return { tags, totalCount }
  },
}

export default TagService
