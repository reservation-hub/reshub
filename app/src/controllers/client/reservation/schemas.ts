import joi from 'joi'

export const reservationUpsertSchema = joi.object({
  reservationDate:
    joi.string().pattern(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d.\d\d\dZ$/).required(),
  menuId: joi.number().required(),
  stylistId: joi.number(),
})

export const reservationQuerySchema = joi.object({
  reservationDate:
    joi.string().pattern(/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T\d\d:\d\d:\d\d.\d\d\dZ$/).required(),
})
