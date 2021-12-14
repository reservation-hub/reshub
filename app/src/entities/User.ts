import { Role } from '@entities/Role'
import { OAuthIds } from '@entities/OAuthIds'

export type Gender = string

export const Male: Gender = 'male'
export const Female: Gender = 'female'

export type User = {
  id: number,
  username?: string,
  password?: string,
  email: string,
  role: Role,
  lastNameKanji?: string,
  firstNameKanji?: string,
  lastNameKana?: string,
  firstNameKana?: string,
  birthday?: Date,
  gender?: Gender,
  oAuthIds?: OAuthIds,
}
