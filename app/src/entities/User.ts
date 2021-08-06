import { Role } from './Role'
import { OAuthIds } from './OAuthIds'

export type Gender = string

export const Male: Gender = 'male'
export const Female: Gender = 'female'

export type User = {
  id: number,
  username?: string | null,
  password?: string,
  email: string,
  roles: Role[],
  lastNameKanji?: string | null,
  firstNameKanji?: string | null,
  lastNameKana?: string | null,
  firstNameKana?: string | null,
  birthday?: Date | null,
  gender?: Gender | null,
  oAuthIDs?: OAuthIds | null,
}
