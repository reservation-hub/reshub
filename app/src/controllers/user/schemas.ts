import joi from 'joi'
import { RoleSlug } from '@request-response-types/models/Role'
import { OrderBy } from '@request-response-types/Common'

export const indexSchema = joi.object({
  page: joi.string().pattern(/^[0-9]+$/),
  order: joi.string().valid(OrderBy.ASC, OrderBy.DESC),
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
  birthday: joi.string().pattern(/^[1-2][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).required(),
})

export const userUpdateSchema = joi.object({
  email: joi.string().email().trim().required(),
  roleSlug: joi.string().valid(RoleSlug.ADMIN, RoleSlug.CLIENT, RoleSlug.SHOP_STAFF).required(),
  firstNameKanji: joi.string().trim().required(),
  lastNameKanji: joi.string().trim().required(),
  firstNameKana: joi.string().trim().required(),
  lastNameKana: joi.string().trim().required(),
  gender: joi.string().valid('male', 'female').required(),
  birthday: joi.string().pattern(/^[1-2][0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).required(),
})

export const userPasswordUpdateSchema = joi.object({
  oldPassword: joi.string().trim().alphanum().required(),
  newPassword: joi.string().trim().alphanum().required(),
  confirmNewPassword: joi.string().trim().alphanum().required(),
})

export const userOAuthIdUpsertSchema = joi.object({
  googleId: joi.string().trim().allow('', null),
  lineId: joi.string().trim().allow('', null),
  twitterId: joi.string().trim().allow('', null),
})

export const searchSchema = joi.object({
  keyword: joi.string().required(),
  page: joi.string().pattern(/^[0-9]+$/),
  order: joi.string().valid(OrderBy.ASC, OrderBy.DESC),
})
