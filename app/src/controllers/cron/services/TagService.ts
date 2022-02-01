import { TagServiceInterface } from '@cron/CronController'
import TagRepository from '@cron/repositories/TagRepository'

export type TagRepositoryInterface = {
  cleanUpTags(): Promise<void>
}

const TagService: TagServiceInterface = {
  async cleanUpTags() {
    await TagRepository.cleanUpTags()
  },
}

export default TagService
