import { Shop } from './Shop'
import { Stylist } from './Stylist'
import { User } from './User'

export type Reservation = {
  id: number,
  shop: Shop,
  reservationDate: Date,
  user: User,
  stylist: Stylist,
}
