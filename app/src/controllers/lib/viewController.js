const eah = require('express-async-handler')
const pluralize = require('pluralize')
const prisma = require('../../db/prisma')

module.exports = {
  /**
   *
   * @param {string} model model string name
   * @param {object} include { relatedMododel: bool } ex { area: true, prefecture:true, city: true }
   * @param {string | [string]} manyToMany m-n relationship target
   * @returns
   */
  index(model, include, manyToMany) {
    return eah(async (req, res) => {
      const { page, order, condition } = req.query
      const skipIndex = page > 1 ? (page - 1) * 10 : 0
      const totalCount = await prisma[model].count()
      let orderBy
      switch (order) {
        case 'desc':
          orderBy = order
          break
        default:
          orderBy = 'asc'
      }

      if (condition) {
        // TODO 絞り込み実装
      }

      const data = await prisma[model].findMany({
        where: {},
        orderBy: { id: orderBy },
        skip: skipIndex,
        take: 10,
        include,
      })

      // clean up data
      if (manyToMany !== undefined) {
        if (Array.isArray(manyToMany)) {
          manyToMany.forEach(target => {
            data.forEach(datum => {
              datum[target] = datum[target].map(d => d[pluralize.singular(target)])
            })
          })
        } else {
          data.forEach(datum => {
            datum[manyToMany] = datum[manyToMany].map(d => d[pluralize.singular(manyToMany)])
          })
        }
      }

      if (model === 'user') {
        data.forEach(item => {
          delete item.password
          return item
        })
      }

      return res.send({ data, totalCount })
    })
  },
  /**
   *
   * @param {string} model model string name
   * @param {object} include { relatedMododel: bool } ex { area: true, prefecture:true, city: true }
   * @param {function} manyToMany convert model's many to many param to array of target model
   * @returns
   */
  show(model, include, manyToMany) {
    return eah(async (req, res, next) => {
      const datum = await prisma[model].findUnique({
        where: { id: parseInt(req.params.id, 10) },
        include,
      })
      if (!datum) return next({ code: 404, message: 'Model not found' })

      if (manyToMany !== undefined) {
        if (Array.isArray(manyToMany)) {
          manyToMany.forEach(target => {
            datum[target] = datum[target].map(d => d[pluralize.singular(target)])
          })
        } else {
          datum[manyToMany] = datum[manyToMany].map(d => d[pluralize.singular(manyToMany)])
        }
      }

      if (model === 'user') {
        delete datum.password
      }
      return res.send(datum)
    })
  },
}
