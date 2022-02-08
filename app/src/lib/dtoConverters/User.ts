import { RoleSlug as EntityRoleSlug } from '@entities/Role'
import { Gender as EntityGender } from '@entities/User'
import { Gender } from '@request-response-types/models/User'
import { RoleSlug } from '@request-response-types/models/Role'

export const convertEntityGenderToDTO = (gender: EntityGender): Gender => {
  switch (gender) {
    case EntityGender.FEMALE:
      return Gender.FEMALE
    default:
      return Gender.MALE
  }
}

export const convertGenderToEntity = (gender: Gender): EntityGender => {
  switch (gender) {
    case Gender.FEMALE:
      return EntityGender.FEMALE
    default:
      return EntityGender.MALE
  }
}

export const convertEntityRoleSlugToDTO = (slug: EntityRoleSlug): RoleSlug => {
  switch (slug) {
    case EntityRoleSlug.ADMIN:
      return RoleSlug.ADMIN
    case EntityRoleSlug.SHOP_STAFF:
      return RoleSlug.SHOP_STAFF
    default:
      return RoleSlug.CLIENT
  }
}

export const convertRoleSlugToEntity = (slug: RoleSlug): EntityRoleSlug => {
  switch (slug) {
    case RoleSlug.ADMIN:
      return EntityRoleSlug.ADMIN
    case RoleSlug.SHOP_STAFF:
      return EntityRoleSlug.SHOP_STAFF
    default:
      return EntityRoleSlug.CLIENT
  }
}
