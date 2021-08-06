import { Area, Prefecture, City } from './Location'

export type Shop = {
  id: number,
  name?: string | null,
  address?: string | null,
  phoneNumber?: string | null,
  area?: Area | null,
  prefecture?: Prefecture | null,
  city?: City | null,
}
