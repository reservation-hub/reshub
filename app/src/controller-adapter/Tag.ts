import {
  Request, Response, NextFunction, Router,
} from 'express'
import { parseIntIdMiddleware } from '@routes/utils'
import {
  TagListQuery, TagListResponse, TagQuery, TagResponse,
  InsertTagQuery, UpdateTagQuery, DeleteTagQuery,
} from '@request-response-types/Tag'
import { ResponseMessage } from '@request-response-types/Common'
import TagController from '@tag/TagController'

export type TagControllerInterface = {
  index(query: TagListQuery): Promise<TagListResponse>
  show(query: TagQuery): Promise<TagResponse>
  insert(query: InsertTagQuery): Promise<ResponseMessage>
  // update(query: UpdateTagQuery): Promise<ResponseMessage>
  // delete(query: DeleteTagQuery): Promise<ResponseMessage>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    return res.send(await TagController.index({ page, order }))
  } catch (e) { return next(e) }
}

const show = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await TagController.show({ id }))
  } catch (e) { return next(e) }
}

const insertTag = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await TagController.insert(body))
  } catch (e) { return next(e) }
}

const updateTag = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { id } = res.locals
    return res.send('Not implemented yet!')
  } catch (e) { return next(e) }
}

const deleteTag = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { id } = res.locals
    return res.send('Not implemented yet!')
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', index)
routes.get('/:id', parseIntIdMiddleware, show)
routes.post('/', insertTag)
routes.patch('/:id', parseIntIdMiddleware, updateTag)
routes.delete('/:id', parseIntIdMiddleware, deleteTag)

export default routes
