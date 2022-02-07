import { UserControllerInterface } from '@controller-adapter/client/User'
import UserService from '@client/user/services/UserService'
import { Gender, User } from '@request-response-types/client/models/User'
import { User as EntityUser } from '@entities/User'
import { signUpSchema, updateUserSchema, userPasswordUpdateSchema } from '@client/user/schemas'
import MailService from '@client/user/services/MailService'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { convertEntityGenderToDTO, convertGenderToEntity } from '@dtoConverters/User'
import {
  convertDateObjectToOutboundDateString, convertDateStringToDateObject,
  convertDateTimeObjectToDateTimeString,
} from '@lib/Date'
import { Reservation } from '@entities/Reservation'

export type UserServiceInterface = {
  fetchUserWithReservationCountAndReviewCount(id: number)
    : Promise<(EntityUser & { reservationCount: number, reviewCount: number })>
  signUpUser(email: string, username: string, password: string, confirm: string): Promise<EntityUser>
  updateUser(id: number, lastNameKanji: string, firstNameKanji: string, lastNameKana: string,
    firstNameKana: string, gender: Gender, birthday: Date): Promise<EntityUser>
  updateUserPassword(id: number, oldPassword: string, newPassword: string, confirmNewPassword: string)
    : Promise<EntityUser>
  fetchUserReservationsWithShopMenuAndStylistNames(userId:number):
   Promise<(Reservation & { shopName: string, StylistName: string, menuName: string})[]>
}

export type MailServiceInterface = {
  sendSignUpEmail(email: string): Promise<void>
}

const reconstructUser = async (userId: number): Promise<User> => {
  const u = await UserService.fetchUserWithReservationCountAndReviewCount(userId)
  return {
    id: u.id,
    username: u.username!,
    email: u.email,
    lastNameKana: u.lastNameKana,
    firstNameKana: u.firstNameKana,
    birthday: u.birthday ? convertDateObjectToOutboundDateString(u.birthday) : undefined,
    gender: u.gender ? convertEntityGenderToDTO(u.gender) : undefined,
    reservationCount: u.reservationCount,
    reviewCount: u.reviewCount,
  }
}

const UserController: UserControllerInterface = {
  async detail(user) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const reservations = await UserService.fetchUserReservationsWithShopMenuAndStylistNames(user.id)
    return {
      user: await reconstructUser(user.id),
      reservations: reservations.map(r => ({
        id: r.id,
        shopId: r.shopId,
        shopName: r.shopName,
        menuName: r.menuName,
        status: r.status,
        reservationDate: convertDateTimeObjectToDateTimeString(r.reservationDate),
        stylistName: r.StylistName,
      })),
    }
  },

  async signUp(query) {
    const {
      email, username, password, confirm,
    } = await signUpSchema.parseAsync(query)
    const user = await UserService.signUpUser(email, username, password, confirm)
    await MailService.sendSignUpEmail(email)
    return reconstructUser(user.id)
  },

  async update(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }

    const {
      lastNameKanji, firstNameKanji, lastNameKana, firstNameKana, gender, birthday,
    } = await updateUserSchema.parseAsync(query)
    const dateObject = convertDateStringToDateObject(birthday)
    await UserService.updateUser(user.id, lastNameKanji, firstNameKanji, lastNameKana, firstNameKana,
      convertGenderToEntity(gender), dateObject)

    return reconstructUser(user.id)
  },

  async updatePassword(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }

    const {
      oldPassword, newPassword, confirmNewPassword,
    } = await userPasswordUpdateSchema.parseAsync(query)
    await UserService.updateUserPassword(user.id, oldPassword, newPassword, confirmNewPassword)

    return 'Password updated'
  },
}

export default UserController
