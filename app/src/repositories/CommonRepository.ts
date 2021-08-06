export type Order = any
export const DescOrder: Order = 'desc'
export const AscOrder: Order = 'asc'

export type CommonRepositoryInterface<T> = {
  fetchAll(page: number, order: Order) :Promise<T[]>,
  totalCount(): Promise<number>,
  fetch(id: number): Promise<T | null>
}
