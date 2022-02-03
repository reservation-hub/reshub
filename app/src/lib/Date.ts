/**
 *
 * @param dateString string date data returned by Joi
 * @returns Date in local time
 */

export const convertDateStringToDateObject = (dateString: string)
  : Date => new Date(dateString)

export const convertDateObjectToOutboundDateString = (date: Date)
  : string => date.toISOString().split('T')[0]

export const convertDateTimeObjectToDateTimeString = (dateTime: Date) => dateTime.toISOString().replace('T', ' ')
  .substring(0, 19)

/**
 *
 * @param hoursAndMinutes hours and minutes in string e.g., 12:30; 18:00
 * @returns returns date with default year, month, and date
 */
export const convertTimeToDateObjectString = (hoursAndMinutes: string)
  : string => `2021-01-01 ${hoursAndMinutes}:00`
