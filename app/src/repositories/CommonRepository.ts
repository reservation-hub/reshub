export type Order = any
export const DescOrder: Order = 'desc'
export const AscOrder: Order = 'asc'

export type CommonRepositoryInterface<T> = {
  fetchAll(query: { page?: number, order?: Order, limit?: number }) :Promise<T[]>,
  totalCount(): Promise<number>,
  fetch(id: number): Promise<T | null>
}
