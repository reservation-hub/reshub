import { Reservation } from '@entities/Reservation'
import { Shop } from '@entities/Shop'

export type StylistSchedule = {
  days: number[],
  startTime: string,
  endTime: string,
}

export type Stylist = {
  id: number,
  name: string,
  price: number,
  shopId?: number,
  shop?: Shop,
  reservations?: Reservation[],
  schedule?: StylistSchedule,
}
