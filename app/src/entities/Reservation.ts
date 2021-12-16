import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { User } from '@entities/User'
import { MenuItem } from './Menu'

export enum ReservationStatus {
  RESERVED,
  CANCELLED,
  COMPLETED
}

export type Reservation = {
  id: number,
  shop?: Shop,
  reservationDate: Date,
  nextAvailableDate: Date,
  user: User,
  status: ReservationStatus
  menuItem: MenuItem
  stylist?: Stylist,
}
