import { Reservation } from './Reservation'
import { Shop } from './Shop'

export type Stylist = {
  id: number,
  name: string,
  shopID?: number | null,
  shops: Shop[],
  reservations?: Reservation[] | null,
}
