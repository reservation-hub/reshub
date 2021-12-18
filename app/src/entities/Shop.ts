import { Area, Prefecture, City } from '@entities/Location'

export type ShopSchedule = {
  days: number[],
  hours: {
    start: string,
    end: string,
  }
}

export type Shop = {
  id: number,
  name: string,
  area: Area,
  prefecture: Prefecture,
  city: City,
  schedule: ShopSchedule,
  address?: string,
  phoneNumber?: string,
  details?: string,
}
