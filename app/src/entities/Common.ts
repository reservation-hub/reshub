export enum ScheduleDays {
  MONDAY = '月',
  TUESDAY = '火',
  WEDNESDAY = '水',
  THURSDAY = '木',
  FRIDAY = '金',
  SATURDAY = '土',
  SUNDAY = '日',
}

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ErrorCode {
  NotFound = 'Not Found',
  InvalidParams = 'Invalid Parameter',
  Authorization = 'Authorization',
  InvalidToken = 'Invalid Token',
  DuplicateModel = 'Duplicate Model',
  LoggedIn = 'Logged In',
  Authentication = 'Authentication',
  Unavailable = 'Unavailable',
  OutOfSchedule = 'OutOfSchedule'
}
