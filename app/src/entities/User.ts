import { Role } from '@entities/Role'
import { OAuthIds } from '@entities/OAuthIds'

export enum Gender {
  MALE,
  FEMALE,
}

export type User = {
  id: number
  username?: string
  password: string
  email: string
  role: Role
  lastNameKanji: string
  firstNameKanji: string
  lastNameKana: string
  firstNameKana: string
  birthday?: Date
  gender?: Gender
  oAuthIds?: OAuthIds
}

export type UserForAuth = {
  id: number,
  role: Role
}
