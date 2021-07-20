const eah = require('express-async-handler')
const prisma = require('../../db/prisma')

exports.viewController = {
  index(model, include, manyToMany) {
    return eah(async (req, res) => {
      const { page } = req.query
      const skipIndex = page > 1 ? (page - 1) * 10 : 0
      const totalCount = await prisma[model].count()
      let data = await prisma[model].findMany({
        orderBy: { id: 'asc' },
        skip: skipIndex,
        take: 10,
        include,
      })

      if (manyToMany !== undefined) {
        data = data.map(datum => manyToMany(datum))
      }

      if (model === 'user') {
        data = data.map(item => {
          delete item.password
          return item
        })
      }

      return res.send({ data, totalCount })
    })
  },
  show(model, include, manyToMany) {
    return eah(async (req, res, next) => {
      let datum = await prisma[model].findUnique({
        where: { id: parseInt(req.params.id, 10) },
        include,
      })
      if (!datum) return next({ code: 404 })

      if (manyToMany !== undefined) {
        datum = manyToMany(datum)
      }

      if (model === 'user') {
        delete datum.password
      }
      return res.send(datum)
    })
  },
}
