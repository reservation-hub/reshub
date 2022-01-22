import { ReservationStatus } from '@prisma/client'
import prisma from '@lib/prisma'
import today from '@lib/Today'

/* eslint-disable */
(async () => {
  
  try {
    const dateString = '2022-01-22T17:00:00+09:00'
    const date = new Date(dateString)
    const localDate = date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo', hour12: false })
    console.log(localDate, date.toISOString())
  } catch (e) { console.error(e) }
  
  process.exit(0)
})()

export {}

/* eslint-enable */
