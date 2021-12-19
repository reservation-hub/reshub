import lastNames from './lastNames'
import maleNames from './maleNames'
import femaleNames from './femaleNames'

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
