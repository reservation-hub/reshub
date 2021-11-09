export type CustomRequest = {
  params: Record<string, unknown>
  body: Record<string, unknown>
  query: Record<string, unknown>
  locals: {
    id?: number,
    shopId?: number,
    menuItemId?: number,
  }
  user: Express.User | undefined
}
