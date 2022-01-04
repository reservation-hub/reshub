import { ReservationStatus as PrismaReservationStatus } from '@prisma/client'
import { ReservationStatus } from '@entities/Reservation'
import { ReservationRepositoryInterface } from '@client/reservation/services/ReservationService'
import prisma from '@/prisma'

const convertReservationStatus = (status: PrismaReservationStatus): ReservationStatus => {
  switch (status) {
    case PrismaReservationStatus.CANCELLED:
      return ReservationStatus.CANCELLED
    case PrismaReservationStatus.COMPLETED:
      return ReservationStatus.COMPLETED
    default:
      return ReservationStatus.RESERVED
  }
}

const ReservationRepository: ReservationRepositoryInterface = {
  async fetchShopReservationsForAvailabilityWithMenuDuration(shopId, reservationDate, rangeInDays, stylistId?) {
    const year = reservationDate.getFullYear()
    const month = reservationDate.getMonth()
    const date = reservationDate.getDate()

    const startDate = new Date(year, month, date)
    const endDate = new Date(year, month, date + rangeInDays)
    const reservations = await prisma.reservation.findMany({
      where: {
        shopId,
        stylistId,
        AND: {
          reservationDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      include: { menu: true },
    })

    return reservations.map(r => ({
      id: r.id,
      shopId: r.shopId,
      reservationDate: r.reservationDate,
      status: convertReservationStatus(r.status),
      clientId: r.userId,
      menuId: r.menuId,
      stylistId: r.stylistId ?? undefined,
      duration: r.menu.duration,
    }))
  },
}

export default ReservationRepository
