export type MenuItem = {
  id: number,
  name: string,
  description: string,
  price: number,
  duration: number //in-minutes
}

export type Menu = {
  id: number,
  items: MenuItem[]
}
