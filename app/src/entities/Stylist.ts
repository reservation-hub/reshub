export type StylistSchedule = {
  days: number[],
  startTime: string,
  endTime: string,
}

export type Stylist = {
  id: number,
  name: string,
  price: number,
  shopId: number,
  schedule: StylistSchedule,
}
