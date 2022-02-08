import { Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@entities/Tag'

export const convertToEntityTag = (tag: PrismaTag): Tag => ({ id: tag.id, slug: tag.slug })
