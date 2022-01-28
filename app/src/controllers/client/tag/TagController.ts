import { TagControllerInterface } from '@controller-adapter/client/Tag'
import { Tag } from '@entities/Tag'
import { OrderBy } from '@request-response-types/Common'
import TagService from '@client/tag/services/TagService'

export type TagServiceInterface = {
  searchTag(keyword: string, page?: number, order?: OrderBy): Promise<{ tags: Tag[], totalCount: number }>
}

const TagController: TagControllerInterface = {
  async search(query) {
    const { keyword, page, order } = query
    const { tags: values, totalCount } = await TagService.searchTag(keyword, page, order)
    return { values, totalCount }
  },
}

export default TagController
