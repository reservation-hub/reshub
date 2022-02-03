import { ReservationRepositoryInterface } from '@client/user/services/UserService'
import prisma from '@lib/prisma'

const ReservationRepository: ReservationRepositoryInterface = {
  async fetchUserReservationCount(userId) {
    return prisma.reservation.count({ where: { userId } })
  },
}

export default ReservationRepository
