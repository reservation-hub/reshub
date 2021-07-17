const eah = require('express-async-handler')
const { schemaMiddleware: middleware, idMiddleware } = require('./validators')

const filterForeignKey = obj => Object.keys(obj).filter(key => obj[key].instance === 'ObjectID' && key !== '_id')

const defaultOptions = {
  idMiddleware: true,
  index: true,
  show: true,
  insert: true,
  update: true,
  delete: true,
  slug: 'id',
  populate: false,
}

exports.registerCrud = (Model, schema, router, options) => {
  const newOptions = {
    ...defaultOptions,
    ...options,
  }
  if (newOptions.idMiddleware && newOptions.slug === 'id') {
    router.use('/:id', idMiddleware())
  }
  if (newOptions.index) {
    router.get('/', this.crudController.index(Model, newOptions))
  }
  if (newOptions.show) {
    router.get(`/:${newOptions.slug}`, this.crudController.show(Model, newOptions))
  }
  if (newOptions.insert) {
    router.post('/', middleware(schema), this.crudController.insert(Model))
  }
  if (newOptions.update) {
    router.patch(`/:${newOptions.slug}`, middleware(schema), this.crudController.update(Model, newOptions))
  }
  if (newOptions.delete) {
    router.delete(`/:${newOptions.slug}`, this.crudController.delete(Model, newOptions))
  }
  return router
}

exports.crudController = {
  index(Model, options = { populate: false }) {
    return eah(async (req, res, next) => {
      const foreignKey = options.populate ? filterForeignKey(Model.schema.paths) : []
      // 納得いかない,でもいま使ってくれ,もうちょっと調べる
      Model.paginate({
        query: {
          id: req._id,
        },
        paginateField: 'createdAt',
        limit: 10,
        next: req.query.next,
      })
        .then(result => {
          result.results.map(item => Model.populate(item, [{ path: foreignKey }]))
          return result
        }).then(result => {
          res.send(result)
        })
        .catch(e => next(e))
    })
  },
  show(Model, options = { slug: 'id', populate: false }) {
    return eah(async (req, res) => {
      const foreignKey = options.populate ? filterForeignKey(Model.schema.paths) : []
      const searchSlug = options.slug === 'id' ? { _id: req.params.id } : { slug: req.params.slug }
      const model = await Model.find(searchSlug)
        .orFail()
        .populate(foreignKey)
        .exec()
      return res.send(model)
    })
  },
  insert(Model) {
    return eah(async (req, res) => {
      const model = new Model(req.body)
      await model.save()
      return res.status(201).send(model)
    })
  },
  update(Model, options = { slug: 'id' }) {
    return eah(async (req, res) => {
      const searchSlug = options.slug === 'id' ? { _id: req.params.id } : { slug: req.params.slug }
      const model = await Model
        .findOneAndUpdate(searchSlug, req.body, { new: true, omitUndefined: true })
        .orFail().exec()
      return res.send(model)
    })
  },
  delete(Model, options = { slug: 'id' }) {
    return eah(async (req, res) => {
      const searchSlug = options.slug === 'id' ? { _id: req.params.id } : { slug: req.params.slug }
      await Model.findOneAndDelete(searchSlug).orFail().exec()
      return res.send({ message: 'Successfully deleted' })
    })
  },
}
