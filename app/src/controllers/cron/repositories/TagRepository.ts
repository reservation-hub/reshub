import { TagRepositoryInterface } from '@cron/services/TagService'
import prisma from '@lib/prisma'

const TagRepository: TagRepositoryInterface = {
  async cleanUpTags() {
    const tagIds = (await prisma.shopTags.groupBy({
      by: ['tagId'],
    })).map(ti => ti.tagId)

    await prisma.tag.deleteMany({
      where: { id: { notIn: tagIds } },
    })
  },
}

export default TagRepository
