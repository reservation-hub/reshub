/**
 *
 * @param dateString string date data returned by Joi
 * @returns Date in local time
 */

export const convertDateStringToDateObject = (dateString: string)
  : Date => new Date(dateString)

export const convertDateObjectToOutboundDateString = (date: Date)
  : string => {
  const dateParts = date.toISOString().split('T')
  const dateString = dateParts[0]
  const time = dateParts[1].split('.')[0]
  return `${dateString} ${time}`
}

/**
 *
 * @param dateString string date data returned by Joi
 * @returns string of hours and minutes. e.g., 12:30; 18:00
 */
export const extractTimeFromInboundDateString = (dateString: string): string => {
  const date = convertDateStringToDateObject(dateString)
  const convertToTwoDigitString = (number: number): string => (`0${number}`).slice(-2)
  const hour = convertToTwoDigitString(date.getHours())
  const minutes = convertToTwoDigitString(date.getMinutes())
  return `${hour}:${minutes}`
}

/**
 *
 * @param hoursAndMinutes hours and minutes in string e.g., 12:30; 18:00
 * @returns returns date with default year, month, and date
 */
export const convertTimeToDateObjectString = (hoursAndMinutes: string)
  : string => `2021-01-01 ${hoursAndMinutes}:00`
