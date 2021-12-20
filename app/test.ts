/* eslint-disable */
import prisma from "@repositories/prisma"

(async () => {
  const reservations = await prisma.reservation.findMany({
    where: { reservationDate: {
      gte: new Date('2021-12-20'),
      lt: new Date('2021-12-21'),
    } },
    include: { menu: true },
    take: 10,
  })
  const nextAvailableDate = (reservationDate: Date, menuDuration: number): Date => {
    const nextAvailableDate = new Date(reservationDate)
    nextAvailableDate.setMinutes(nextAvailableDate.getMinutes() + menuDuration)
    return nextAvailableDate
  }
  const reservationDate = new Date('2021-12-20 14:00:00')
  const reservationDuration = 60
  const reservationEndTime = nextAvailableDate(reservationDate, reservationDuration).getTime()
  const isAvailable = reservations.every(r => {
    const rStartTime = r.reservationDate.getTime()
    const rEndTime = nextAvailableDate(r.reservationDate, r.menu.duration).getTime()
    return !((rStartTime <= reservationDate.getTime() && reservationDate.getTime() < rEndTime) ||
      (rStartTime <= reservationEndTime && reservationEndTime < rEndTime)) 
  })
  console.log('reservation date, duration', reservationDate, reservationDuration)
  console.log('other reservations : ', reservations.map(r => ({ date: r.reservationDate, duration: r.menu.duration})))
  console.log('is available: ', isAvailable)
  process.exit(0)
})()

export {}

/* eslint-enable */
