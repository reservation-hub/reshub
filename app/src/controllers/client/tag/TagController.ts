import { TagControllerInterface } from '@controller-adapter/client/Tag'
import { Tag } from '@entities/Tag'
import { OrderBy as EntityOrderBy } from '@entities/Common'
import TagService from '@client/tag/services/TagService'
import { convertOrderByToEntity } from '@dtoConverters/Common'

export type TagServiceInterface = {
  searchTag(keyword: string, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ tags: Tag[], totalCount: number }>
}

const TagController: TagControllerInterface = {
  async search(query) {
    const {
      keyword, page, order, take,
    } = query
    const { tags: values, totalCount } = await TagService.searchTag(
      keyword,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    return { values, totalCount }
  },
}

export default TagController
