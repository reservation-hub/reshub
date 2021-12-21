import Joi from 'joi'
import { OrderBy } from '@entities/Common'

export default Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})
