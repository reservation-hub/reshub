import { Area, Prefecture, City } from '@entities/Location'
import { ScheduleDays } from './Common'

export type Shop = {
  id: number
  name: string
  area: Area
  prefecture: Prefecture
  city: City
  days: ScheduleDays[]
  seats: number
  startTime: string
  endTime: string
  address?: string
  phoneNumber?: string
  details?: string
}
