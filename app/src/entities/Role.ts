export enum RoleSlug {
    ADMIN = 'admin',
    SHOP_STAFF = 'shop_staff',
    CLIENT = 'client'
}

export type Role = {
    id: number,
    name: string,
    description: string,
    slug: RoleSlug,
}
