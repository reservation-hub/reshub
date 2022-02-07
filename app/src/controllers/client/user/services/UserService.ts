import bcrypt from 'bcrypt'
import { Gender, User } from '@entities/User'
import { DuplicateModelError, InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import { UserServiceInterface } from '@client/user/UserController'
import UserRepository from '@client/user/repositories/UserRepository'
import ReservationRepository from '@client/user/repositories/ReservationRepository'
import ReviewRepository from '@client/user/repositories/ReviewRepository'
import MenuRepository from '@client/user/repositories/MenuRepository'
import ShopRepository from '@client/user/repositories/ShopRepository'
import StylistRepository from '@client/user/repositories/StylistRepository'
import { Reservation } from '@entities/Reservation'

export type UserRepositoryInterface = {
  fetchUser(id: number): Promise<User | null>
  insertUser(email: string, username: string, password: string): Promise<User>
  emailAndUsernameAreAvailable(email: string, username: string): Promise<boolean>
  updateUser(id: number, lastNameKanji: string, firstNameKanji: string, lastNameKana: string, firstNameKana: string,
    gender: Gender, birthday: Date): Promise<User>
    updateUserPassword(id: number, password: string): Promise<User>
}

export type MenuRepositoryInterface = {
  fetchMenuNamesByIds(ids: number[]): Promise<{menuId: number, menuName: string}[]>
}

export type ShopRepositoryInterface = {
  fetchShopNamesByIds(ids: number[]): Promise<{shopId: number, shopName: string}[]>
}

export type StylistRepositoryInterface = {
  fetchStylistNamesByIds(ids: number[]): Promise<{stylistId: number, stylistName: string}[]>
}

export type ReservationRepositoryInterface = {
  fetchUserReservationCount(id: number): Promise<number>
  fetchUserReservations(id: number): Promise<Reservation[]>
}

export type ReviewRepositoryInterface = {
  fetchUserReviewCount(id: number): Promise<number>
}

const UserService: UserServiceInterface = {
  async fetchUserWithReservationCountAndReviewCount(id) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      throw new NotFoundError(`User ${id} not found`)
    }

    const reservationCount = await ReservationRepository.fetchUserReservationCount(id)
    const reviewCount = await ReviewRepository.fetchUserReviewCount(id)

    return { ...user, reservationCount, reviewCount }
  },
  async signUpUser(email, username, password, confirm) {
    if (password !== confirm) {
      throw new InvalidParamsError('passwords did not match')
    }

    const emailAndUsernameAreAvailable = await UserRepository.emailAndUsernameAreAvailable(email, username)
    if (!emailAndUsernameAreAvailable) {
      throw new DuplicateModelError('Email / Username is not available')
    }
    const hash = bcrypt.hashSync(password, 10 /* hash rounds */)
    return UserRepository.insertUser(email, username, hash)
  },

  async updateUser(id, lastNameKanji, firstNameKanji, lastNameKana, firstNameKana,
    gender, birthday) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      throw new NotFoundError(`User ${id} does not exist`)
    }

    return UserRepository.updateUser(
      id, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, birthday,
    )
  },

  async updateUserPassword(id, oldPassword, newPassword, confirmNewPassword) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      throw new NotFoundError(`User ${id} does not exist`)
    }

    const passwordMatches = await bcrypt.compare(oldPassword, user.password)
    if (!passwordMatches) {
      throw new InvalidParamsError('Old password do not match')
    }

    if (newPassword !== confirmNewPassword) {
      throw new InvalidParamsError('Passwords do not match')
    }

    const hash = bcrypt.hashSync(newPassword, 10 /* hash rounds */)

    return UserRepository.updateUserPassword(id, hash)
  },

  async fetchUserReservationsWithShopMenuAndStylistNames(userId) {
    const reservations = await ReservationRepository.fetchUserReservations(userId)
    if (!reservations) {
      throw new NotFoundError('No reservations found for this user')
    }
    const menuIds: number[] = []
    const shopIds: number[] = []
    const stylistIds: number[] = []
    reservations.forEach(r => {
      menuIds.push(r.menuId)
      shopIds.push(r.shopId)
      if (r.stylistId) {
        stylistIds.push(r.stylistId)
      }
    })
    const reservationMenus = await MenuRepository.fetchMenuNamesByIds(menuIds)
    const reservationShops = await ShopRepository.fetchShopNamesByIds(shopIds)
    const reservationStylists = await StylistRepository.fetchStylistNamesByIds(stylistIds)

    return reservations.map(r => ({
      ...r,
      shopName: reservationShops.find(s => s.shopId === r.shopId)!.shopName,
      StylistName: reservationStylists.find(s => s.stylistId === r.stylistId)!.stylistName,
      menuName: reservationMenus.find(m => m.menuId === r.menuId)!.menuName,
    }))
  },
}

export default UserService
