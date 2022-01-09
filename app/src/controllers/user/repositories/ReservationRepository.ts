import { ReservationRepositoryInterface } from '@user/services/UserService'
import prisma from '@/prisma'

const ReservationRepository: ReservationRepositoryInterface = {

  async fetchUsersReservationCounts(userIds) {
    const reservations = await prisma.reservation.findMany({
      where: { userId: { in: userIds } },
    })

    return userIds.map(id => ({
      userId: id,
      reservationCount: reservations.filter(r => r.userId === id).length,
    }))
  },

}

export default ReservationRepository
