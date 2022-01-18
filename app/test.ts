import { ReservationStatus } from '@prisma/client'
import prisma from '@lib/prisma'
import today from '@lib/Today'

/* eslint-disable */
(async () => {
  
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        reservationDate: { lte: today},
        AND: { status: ReservationStatus.RESERVED}
      }
    })
    console.log(reservations)
  } catch (e) { console.error(e) }
  
  process.exit(0)
})()

export {}

/* eslint-enable */
