import Joi from 'joi'
import date from '@joi/date'
import { RoleSlug } from '@request-response-types/models/Role'
import { OrderBy } from '@/request-response-types/Common'

const joi = Joi.extend(date)

export const indexSchema = Joi.object({
  page: Joi.string().pattern(/^[0-9]+$/),
  order: Joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})

export const userInsertSchema = joi.object({
  password: joi.string().trim().alphanum().required(),
  confirm: joi.string().trim().alphanum().required(),
  email: joi.string().email().trim().required(),
  roleSlug: joi.string().valid(RoleSlug.ADMIN, RoleSlug.CLIENT, RoleSlug.SHOP_STAFF).required(),
  firstNameKanji: joi.string().trim().required(),
  lastNameKanji: joi.string().trim().required(),
  firstNameKana: joi.string().trim().required(),
  lastNameKana: joi.string().trim().required(),
  gender: joi.string().valid('male', 'female').required(),
  birthday: joi.date().format('YYYY-MM-DD').required(),
})

export const userUpdateSchema = joi.object({
  email: joi.string().email().trim().required(),
  roleSlug: joi.string().valid(RoleSlug.ADMIN, RoleSlug.CLIENT, RoleSlug.SHOP_STAFF).required(),
  firstNameKanji: joi.string().trim().required(),
  lastNameKanji: joi.string().trim().required(),
  firstNameKana: joi.string().trim().required(),
  lastNameKana: joi.string().trim().required(),
  gender: joi.string().valid('male', 'female').required(),
  birthday: joi.date().format('YYYY-MM-DD').required(),
})

export const userOAuthIdUpsertSchema = joi.object({
  googleId: joi.string().trim().allow('', null),
  lineId: joi.string().trim().allow('', null),
  twitterId: joi.string().trim().allow('', null),
})

export const searchSchema = Joi.object({
  keyword: Joi.string().required(),
})
