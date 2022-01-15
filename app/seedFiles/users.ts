import { Gender, randomNameGenerator } from './utils'

/**
 * numbers of dummy users
 */
const staffCount = 100
const clientCount = 2000

export type UserObject = {
  firstNameKanji: string
  lastNameKanji: string
  firstNameKana: string
  lastNameKana: string
  username: string
  password: string
  email: string
}

export const admins = [
  {
    firstNameKanji: 'eugene',
    lastNameKanji: 'sinamban',
    firstNameKana: 'ユージン',
    lastNameKana: 'シナンバン',
    password: '123123qq',
    email: 'eugene.sinamban@gmail.com',
    username: 'eugene.sinamban@gmail.com',
  },
  {
    firstNameKanji: 'yoonsung',
    lastNameKanji: 'jang',
    firstNameKana: 'ユンソン',
    lastNameKana: 'チャン',
    password: '123123qq',
    email: 'upthe15752@gmail.com',
    username: 'upthe15752@gmail.com',
  },
  {
    firstNameKanji: 'sabir',
    lastNameKanji: 'barahi',
    firstNameKana: 'サビル',
    lastNameKana: 'バラヒ',
    password: '123123qq',
    email: 'sabirbarahi41@gmail.com',
    username: 'sabirbarahi41@gmail.com',
  },
]

export const staffs = Array(staffCount).fill('').map((s, i): UserObject => {
  const randomName = randomNameGenerator(i % 2 === 0 ? Gender.FEMALE : Gender.MALE)
  return {
    firstNameKanji: randomName.firstName,
    lastNameKanji: randomName.lastName,
    firstNameKana: randomName.firstName,
    lastNameKana: randomName.lastName,
    password: '123123qq',
    email: `staff${i + 1}@staff.com`,
    username: `staff${i + 1}@staff.com`,
  }
})

export const clients = Array(clientCount).fill('').map((c, i): UserObject => {
  const randomName = randomNameGenerator(i % 2 === 0 ? Gender.FEMALE : Gender.MALE)
  return {
    firstNameKanji: randomName.firstName,
    lastNameKanji: randomName.lastName,
    firstNameKana: randomName.firstName,
    lastNameKana: randomName.lastName,
    password: '123123qq',
    email: `${randomName.lastName.toLowerCase()}${randomName.firstName.toLowerCase()}${i}@client.com`,
    username: `${randomName.lastName.toLowerCase()}${randomName.firstName.toLowerCase()}${i}`,
  }
})
