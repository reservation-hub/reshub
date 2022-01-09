import { CronControllerInterface } from '@lib/Cron'
import MenuService from '@cron/services/MenuService'

export type MenuServiceInterface = {
  setPopularMenus(): Promise<void>
}

const CronController: CronControllerInterface = {
  async setPopularMenus() {
    await MenuService.setPopularMenus()
  },
}

export default CronController
