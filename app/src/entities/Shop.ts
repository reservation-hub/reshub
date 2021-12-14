import { Area, Prefecture, City } from '@entities/Location'
import { Menu } from '@entities/Menu'
import { Stylist } from '@entities/Stylist'
import { Reservation } from '@entities/Reservation'

export type ShopSchedule = {
  days: number[],
  hours: {
    start: string,
    end: string,
  }
}

export type Shop = {
  id: number,
  name?: string,
  address?: string,
  phoneNumber?: string,
  area?: Area,
  prefecture?: Prefecture,
  city?: City,
  menu?: Menu,
  details?: string,
  schedule?: ShopSchedule,
  stylists?: Stylist[],
  reservations?: Reservation[]
}
