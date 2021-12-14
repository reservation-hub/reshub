export type Area = {
    id: number,
    name: string,
    slug: string,
}

export type Prefecture = {
    id: number,
    name: string,
    slug: string,
}

export type City = {
    id: number,
    name: string,
    slug: string,
}

export type Location = {
    area: Area,
    prefecture: Prefecture,
    city: City,
}
