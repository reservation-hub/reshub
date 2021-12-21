/* eslint-disable */
import prisma from "@/prisma"

(async () => {
  const reservationDate = new Date('2021-12-20 14:00:00')
  const startDate = new Date(reservationDate.toISOString().split('T')[0])
  const endDate = new Date(startDate.getTime() + ( 3600 * 1000 * 24) /* one day in ms*/)
  const reservations = await prisma.reservation.findMany({
    where: { reservationDate: {
      gte: startDate,
      lt: endDate,
    } },
    include: { menu: true },
    take: 10,
  })
  const nextAvailableDate = (reservationDate: Date, menuDuration: number): Date => {
    const nextAvailableDate = new Date(reservationDate)
    nextAvailableDate.setMinutes(nextAvailableDate.getMinutes() + menuDuration)
    return nextAvailableDate
  }
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
