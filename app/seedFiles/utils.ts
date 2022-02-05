import lastNames from './lastNames'
import maleNames from './maleNames'
import femaleNames from './femaleNames'
import { ReviewScore, Role } from '@prisma/client'
import {  UserObject } from './users'
import bcrypt from 'bcrypt'

export enum Gender {
  MALE,
  FEMALE
}

export const randomNameGenerator = (gender: Gender): { firstName: string, lastName: string } => {
  const lastNameIndex = Math.floor(Math.random() * lastNames.length)
  const lastName = lastNames[lastNameIndex]
  let firstNameIndex
  let firstName
  if (gender === Gender.MALE) {
    firstNameIndex = Math.floor(Math.random() * maleNames.length)
    firstName = maleNames[firstNameIndex]
  } else {
    firstNameIndex = Math.floor(Math.random() * femaleNames.length)
    firstName = femaleNames[firstNameIndex]
  }
  return { firstName, lastName }
}

export const randomReviewScoreGenerator = (): ReviewScore => {
  const reviewScores = [
    ReviewScore.ONE,
    ReviewScore.TWO,
    ReviewScore.THREE,
    ReviewScore.FOUR,
    ReviewScore.FIVE,
  ]
  return reviewScores[Math.floor(Math.random() * 5)]
}

export const getRandomDate = (from: Date, to: Date) => {
  const fromTime = from.getTime()
  const toTime = to.getTime()
  return new Date(fromTime + Math.random() * (toTime - fromTime))
}

export const userDataObject = (r: Role, u: UserObject) => ({
  email: u.email,
  username: u.email,
  password: bcrypt.hashSync(u.password, 10),
  profile: {
    create: {
      firstNameKana: u.firstNameKana,
      lastNameKana: u.lastNameKana,
      firstNameKanji: u.firstNameKanji,
      lastNameKanji: u.lastNameKanji,
    },
  },
  role: {
    connect: { id: r.id },
  },
})
