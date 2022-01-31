import {
  Request, Response, NextFunction, Router,
} from 'express'
import { TagListResponse, TagSearchQuery } from '@request-response-types/client/Tag'
import TagController from '@tag/TagController'
import parseToInt from '@lib/ParseInt'

export type TagControllerInterface = {
  search(query: TagSearchQuery): Promise<TagListResponse>
}

const searchTag = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const {
      keyword, page, order, take,
    } = req.query
    return res.send(await TagController.search({
      keyword, page: parseToInt(page), order, take: parseToInt(take),
    }))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/search', searchTag)

export default routes
