const Joi = require('joi').extend(require('@joi/date'))

exports.reservationUpsertSchema = Joi.object({
  reservationDate: Joi.date().format('YYYY-MM-DD').utc().required(),
  shopID: Joi.number().required(),
  stylistID: Joi.number().required(),
  userID: Joi.number().required(),
})
