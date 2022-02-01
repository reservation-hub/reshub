export enum ReviewScore {
  one,
  two,
  three,
  four,
  five
}

export type Review = {
  id: number
  text: string
  score: ReviewScore
  clientId: number
  shopId: number
}
