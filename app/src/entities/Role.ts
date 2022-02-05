export enum RoleSlug {
    ADMIN = 'ADMIN',
    SHOP_STAFF = 'SHOP_STAFF',
    CLIENT = 'CLIENT'
}

export type Role = {
    id: number,
    name: string,
    description: string,
    slug: RoleSlug,
}
