import Joi from 'joi'
import date from '@joi/date'

const joi = Joi.extend(date)

export const userInsertSchema = joi.object({
  password: joi.string().trim().alphanum().required(),
  confirm: joi.string().trim().alphanum().required(),
  email: joi.string().email().trim().required(),
  roleIDs: joi.array().items(joi.number()).min(1).required(),
  firstNameKanji: joi.string().trim().required(),
  lastNameKanji: joi.string().trim().required(),
  firstNameKana: joi.string().trim().required(),
  lastNameKana: joi.string().trim().required(),
  gender: joi.string().valid('male', 'female').required(),
  birthday: joi.date().format('YYYY-MM-DD').required(),
})

export const userUpdateSchema = joi.object({
  email: joi.string().email().trim().required(),
  roleIDs: joi.array().items(joi.number()).min(1).required(),
  firstNameKanji: joi.string().trim().required(),
  lastNameKanji: joi.string().trim().required(),
  firstNameKana: joi.string().trim().required(),
  lastNameKana: joi.string().trim().required(),
  gender: joi.string().valid('male', 'female').required(),
  birthday: joi.date().format('YYYY-MM-DD').required(),
})

export const userOAuthIDUpsertSchema = joi.object({
  googleID: joi.string().trim().allow('', null),
  lineID: joi.string().trim().allow('', null),
  twitterID: joi.string().trim().allow('', null),
})
