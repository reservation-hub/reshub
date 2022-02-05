export enum RoleSlug {
    ADMIN,
    SHOP_STAFF,
    CLIENT
}

export type Role = {
    id: number,
    name: string,
    description: string,
    slug: RoleSlug,
}
