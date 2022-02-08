import { ReservationStatus as EntityReservationStatus } from '@entities/Reservation'
import { ReservationStatus } from '@request-response-types/models/Reservation'

export const convertStatusToPDO = (status: EntityReservationStatus): ReservationStatus => {
  switch (status) {
    case EntityReservationStatus.CANCELLED:
      return ReservationStatus.CANCELLED
    case EntityReservationStatus.COMPLETED:
      return ReservationStatus.COMPLETED
    default:
      return ReservationStatus.RESERVED
  }
}
