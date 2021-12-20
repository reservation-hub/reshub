import Joi from 'joi'
import { DescOrder, AscOrder } from '@repositories/CommonRepository'

export default Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().valid(DescOrder, AscOrder),
})
