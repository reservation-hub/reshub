export enum ReservationStatus {
  RESERVED = 'RESERVED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export type Reservation = {
  id: number,
  shopId: number
  reservationDate: Date,
  clientId: number
  status: ReservationStatus
  menuId: number
  stylistId?: number
}
