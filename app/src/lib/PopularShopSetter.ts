import prisma from '@lib/prisma'
import redis from '@lib/redis'
import { ReservationStatus } from '@prisma/client'

const setPopularShops = async (): Promise<void> => {
  const shops = await prisma.$queryRaw<{
      /* eslint-disable */
      shop_id: number
      average_review_score: number
      ranking_factor: number
      /* eslint-enable */
    }[]>(`
    select s.id as shop_id, avg(r.score) as average_review_score, rf.ranking_factor as ranking_factor
    from "Shop" s
    left join "Review" r on r.shop_id = s.id
    left join (
      select
      s.id as shop_id,
      sum(
        (
          select count(*) from "Reservation" as rr
          where rr.shop_id = s.id
          and rr.status = '${ReservationStatus.COMPLETED}'
        ) *
        (
          select count(*) from "Review" as rv
          where rv.shop_id = s.id
        ) *
        (
          select sum(r.score) from "Review" r
          where r.shop_id = s.id
        )
      ) as ranking_factor
      from "Shop" s
      group by s.id
      order by ranking_factor desc
      limit 5) rf
    on rf.shop_id = s.id
    where ranking_factor is not null
    group by s.id, rf.ranking_factor
    order by ranking_factor desc;
      `)
  const parsedShops = shops.map(m => ({
    shopId: m.shop_id,
    averageReviewScore: m.average_review_score,
    rankingFactor: m.ranking_factor,
  }))
  await redis.set('popularShops', JSON.stringify(parsedShops))
}

export default setPopularShops
