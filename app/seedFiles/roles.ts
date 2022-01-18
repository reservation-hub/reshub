import { RoleSlug } from '@prisma/client'

export type RoleObject = {
  name: string
  slug: RoleSlug
  description: string
}
export default [
  {
    name: 'admin',
    slug: RoleSlug.ADMIN,
    description: 'Administrator role. Can make changes on everything.',
  },
  {
    name: 'client',
    slug: RoleSlug.CLIENT,
    description: 'Client role. Can make profile and reservations.',
  },
  {
    name: 'shop staff',
    slug: RoleSlug.SHOP_STAFF,
    description: 'Shop staff user role. Can view shop details connected to the user.',
  },
]
