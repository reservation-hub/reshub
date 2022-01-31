import { OrderBy } from '@entities/Common'
import { Tag } from '@entities/Tag'
import { TagServiceInterface } from '@client/tag/TagController'
import TagRepository from '@client/tag/repositories/TagRepository'

export type TagRepositoryInterface = {
  searchTag(keyword: string, page: number, order: OrderBy, take: number): Promise<Tag[]>
  searchTagTotalCount(keyword: string): Promise<number>
}

const TagService: TagServiceInterface = {
  async searchTag(keyword, page = 1, order = OrderBy.DESC, take = 10) {
    const tags = await TagRepository.searchTag(keyword, page, order, take)
    const totalCount = await TagRepository.searchTagTotalCount(keyword)
    return { tags, totalCount }
  },
}

export default TagService
