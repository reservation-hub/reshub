export const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,}$/

export const datePattern = /^[1-2][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

export const dateTimePattern = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) \d\d:\d\d:00$/

export const hoursPattern = /^\d\d:\d\d$/

export const noWhiteSpaceInBetweenPattern = /^[a-zA-Z0-9_]+$/
