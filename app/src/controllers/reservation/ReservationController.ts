import { Menu } from '@entities/Menu'
import { Reservation } from '@entities/Reservation'
import { Shop } from '@entities/Shop'
import { Stylist } from '@entities/Stylist'
import { User, UserForAuth } from '@entities/User'
import ReservationService from '@reservation/services/ReservationService'
import { ReservationControllerInterface } from '@/controller-adapter/Shop'
import { indexSchema } from './schemas'
import { OrderBy } from '@/request-response-types/Common'

export type ReservationServiceInterface = {
  fetchReservationsWithClientAndStylistAndMenu(user: UserForAuth, shopId: number, page?: number, order?: OrderBy)
    : Promise<(Reservation & { client: User, menu: Menu, shop: Shop, stylist?: Stylist })[]>
  fetchShopReservationTotalCount(user: UserForAuth, shopId: number): Promise<number>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const ReservationController: ReservationControllerInterface = {
  async index(user, query) {
    const { page, order } = await indexSchema.validateAsync(query, joiOptions)
    const { shopId } = query
    const reservations = await ReservationService.fetchReservationsWithClientAndStylistAndMenu(
      user, shopId, page, order,
    )
    const totalCount = await ReservationService.fetchShopReservationTotalCount(user, shopId)

    const reservationList = reservations.map(r => ({
      id: r.id,
      shopId: r.shopId,
      shopName: r.shop.name,
      clientName: `${r.client.lastNameKana!} ${r.client.firstNameKana!}`,
      menuName: r.menu.name,
      stylistName: r.stylist?.name,
      status: r.status,
      reservationDate: r.reservationDate,
    }))

    return { values: reservationList, totalCount }
  },
}

export default ReservationController
