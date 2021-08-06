import { Prisma } from '@prisma/client'

import prisma from './prisma'
import { CommonRepositoryInterface } from './CommonRepository'
import { StylistRepositoryInterface as StylistServiceSocket } from '../services/StylistService'
import { StylistRepositoryInterface as ShopServiceSocket } from '../services/ShopService'
import { Stylist } from '../entities/Stylist'

const stylistWithShops = Prisma.validator<Prisma.StylistArgs>()(
  { include: { shops: { include: { shop: { include: { shopDetail: true } } } } } },
)
type stylistWithShops = Prisma.StylistGetPayload<typeof stylistWithShops>

export const reconstructStylist = (stylist: stylistWithShops): Stylist => ({
  id: stylist.id,
  name: stylist.name,
  shops: stylist.shops.map(shopStylists => ({
    id: shopStylists.shopID,
    name: shopStylists.shop.shopDetail?.name,
  })),
})

export const fetchAll = async (page = 0, order: any = 'asc'): Promise<Stylist[]> => {
  const skipIndex = page > 1 ? (page - 1) * 10 : 0
  const limit = 10
  const stylists = await prisma.stylist.findMany({
    skip: skipIndex,
    orderBy: { id: order },
    take: limit,
    include: { shops: { include: { shop: { include: { shopDetail: true } } } } },
  })
  const cleanStylists = stylists.map(stylist => reconstructStylist(stylist))
  return cleanStylists
}

export const totalCount = async (): Promise<number> => prisma.stylist.count()

export const fetch = async (id: number): Promise<Stylist | null> => {
  const stylist = await prisma.stylist.findUnique({
    where: { id },
    include: { shops: { include: { shop: { include: { shopDetail: true } } } } },
  })
  return stylist ? reconstructStylist(stylist) : null
}

export const insertStylist = async (name: string, shopIDs: number[])
: Promise<Stylist> => {
  const stylist = await prisma.stylist.create({
    data: {
      name,
      shops: {
        create: shopIDs.map(id => ({
          shop: {
            connect: { id },
          },
        })),
      },
    },
    include: { shops: { include: { shop: { include: { shopDetail: true } } } } },
  })
  const cleanStylist = reconstructStylist(stylist)
  return cleanStylist
}

export const updateStylist = async (id: number, name: string, shopIDsToAdd: number[], shopIDsToRemove: number[])
: Promise<Stylist> => {
  let removeQuery
  if (shopIDsToRemove.length > 0) {
    removeQuery = `
      DELETE
      FROM "ShopStylists"
      WHERE stylist_id = ${id}
      AND shop_id IN (${shopIDsToRemove.toString()});`
  }

  let shopAddQuery
  if (shopIDsToAdd.length > 0) {
    shopAddQuery = {
      create: shopIDsToAdd.map(id => ({
        shop: {
          connect: { id },
        },
      })),
    }
  }

  const updateQuery = {
    where: { id },
    data: {
      name,
      shops: shopAddQuery,
    },
    include: { shops: { include: { shop: { include: { shopDetail: true } } } } },
  }

  // execute
  if (removeQuery) {
    const transactionResult = await prisma.$transaction([
      prisma.$queryRaw(removeQuery),
      prisma.stylist.update(updateQuery),
    ])
    const cleanStylist = reconstructStylist(transactionResult[1])
    return cleanStylist
  }

  const stylist = await prisma.stylist.update(updateQuery)
  const cleanStylist = reconstructStylist(stylist)
  return cleanStylist
}

export const deleteStylist = async (id: number): Promise<Stylist> => {
  const stylist = await prisma.stylist.delete({
    where: { id },
    include: { shops: { include: { shop: { include: { shopDetail: true } } } } },
  })
  const cleanStylist = reconstructStylist(stylist)
  return cleanStylist
}

export const fetchStylistsByShopIDs = async (shopIDs: number[])
: Promise<{ id: number, name: string, shopID:number }[]> => {
  const query = `
    SELECT st.id, st.name, sp.id as shop_id
    FROM "Stylist" AS st 
    LEFT JOIN "ShopStylists" AS ss ON st.id = ss.stylist_id
    LEFT JOIN "Shop" as sp on sp.id = ss.shop_id
    WHERE sp.id in (${shopIDs})
    `
  const data = await prisma.$queryRaw(query)

  // convert snakecase to camelcase
  data.forEach((datum: any) => {
    datum.shopID = datum.shop_id
    delete datum.shop_id
  })
  return data
}

export const fetchStylistsCountByShopIDs = async (shopIDs: number[])
: Promise<{ id: number, count: number }[]> => {
  const stylists = await fetchStylistsByShopIDs(shopIDs)
  const finalData = shopIDs.map(id => ({ id, count: stylists.filter(stylist => id === stylist.shopID).length }))
  return finalData
}

export const StylistRepository: CommonRepositoryInterface<Stylist> & ShopServiceSocket & StylistServiceSocket = {
  fetchAll,
  totalCount,
  fetch,
  insertStylist,
  updateStylist,
  deleteStylist,
  fetchStylistsByShopIDs,
  fetchStylistsCountByShopIDs,
}

export default StylistRepository
