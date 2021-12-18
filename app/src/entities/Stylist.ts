import { ScheduleDays } from './Common'

export type Stylist = {
  id: number,
  name: string,
  price: number,
  shopId: number,
  days: ScheduleDays[],
  startTime: string,
  endTime: string,
}
