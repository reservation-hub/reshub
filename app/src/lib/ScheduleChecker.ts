import { ScheduleDays } from '@entities/Common'

export const timeToString = (dateTime : Date): string => {
  const hours = dateTime.getHours().toString()
  const minutes = dateTime.getMinutes().toString()
  return `${hours}:${minutes}`
}

export const convertToDate = (time: string): Date => new Date(`2021-01-01 ${time}:00`)
export const convertToUnixTime = (time:string): number => convertToDate(time).getTime()

const isWithinSchedule = (baseStartTime: string, baseEndTime: string, days: ScheduleDays[],
  startTimeToBeChecked: Date, endTimeToBeChecked: Date, targetDays: ScheduleDays[]): boolean => {
  const targetStartTime = convertToUnixTime(timeToString(startTimeToBeChecked))
  const targetEndTime = convertToUnixTime(timeToString(endTimeToBeChecked))
  const baseStartTimeUnix = convertToUnixTime(baseStartTime)
  const baseEndTimeUnix = convertToUnixTime(baseEndTime)
  const isWithinShopTime = !(baseStartTimeUnix > targetStartTime || targetEndTime > baseEndTimeUnix)

  const isWithinShopDays = targetDays.every(d => days.some(td => td === d))

  return isWithinShopTime && isWithinShopDays
}

export default isWithinSchedule
