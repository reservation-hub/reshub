/* eslint-disable */
import MenuRepository, { setPopularMenus } from '@client/menu/repositories/MenuRepository'

(async () => {

  try {
    await setPopularMenus(2022, 2)
    const popularMenus = await MenuRepository.fetchPopularMenus(2022, 2)
    console.log(popularMenus)

  } catch (e) { console.error(e) }
  
  process.exit(0)
})()

export {}

/* eslint-enable */
