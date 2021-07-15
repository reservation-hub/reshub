
//納得いかないでもいま使ってくれもうちょっと調べる
const db = mongoist(process.env.DB_HOST)
const { schemaMiddleware: middleware, idMiddleware } = require('./validators')
const { filterForeignKey } = require('./filter')
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
    ...options
  }
  if (newOptions.idMiddleware && 'id' === newOptions.slug) {
    router.use(`/:id`, idMiddleware())
  }
  if (newOptions.index) {
    router.get(`/`, this.crudController.index(Model, newOptions))
  }
  if (newOptions.show) {
    router.get(`/:${newOptions.slug}`, this.crudController.show(Model, newOptions))
  }
  if (newOptions.insert) {
    router.post(`/`, middleware(schema), this.crudController.insert(Model))
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
  index(Model, options = { populate: false}) {
    return async (req, res, next) => {
      const foreignKey = options.populate ? filterForeignKey(Model.schema.paths) : []
     

      //納得いかない,でもいま使ってくれ,もうちょっと調べる

      Model.paginate( {
        query: {
          id: req._id,
        },
        paginateField: 'created',
        limit:10,
        next: req.query.next,
        previous: req.query.previous 
      })
      .then(result=>{
        result.results = result.results
        result.results.map(item => Model.populate(item,[{path: foreignKey}]))
        return result
      }).then(result=>{
        res.send(result)
      })
      .catch(e => next(e))
    }
  },
  show(Model, options = { slug: 'id', populate: false}) {
    return (req, res, next) => {
      const foreignKey = options.populate ? filterForeignKey(Model.schema.paths) : []
      const searchSlug = 'id' === options.slug ? {_id: req.params.id} : {slug: req.params.slug}
      Model.find(searchSlug).orFail()
      .populate(foreignKey)
      .exec()
      .then(model => {
        return res.send(model)
      })
      .catch(e => next(e))
    }
  },
  insert(Model) {
    return (req, res, next) => {
      const model = new Model(req.body)
      model.save()
      .then(result => res.status(201).send(result))
      .catch(e => next(e))
    }
  },
  update(Model, options = { slug: 'id' }) {
    return (req, res, next) => {
      const searchSlug = 'id' === options.slug ? {_id: req.params.id} : {slug: req.params.slug}
      Model.findOneAndUpdate(searchSlug, req.body, {new: true, omitUndefined: true}).orFail().exec()
      .then(model => {
        return res.send(model)
      })
      .catch(e => next(e))
    }
  },
  delete(Model, options = { slug : 'id' }) {
    return (req, res, next) => {
      const searchSlug = 'id' === options.slug ? {_id: req.params.id} : {slug: req.params.slug}
      Model.findOneAndDelete(searchSlug).orFail().exec()
      .then(result => {
        return res.send({message: 'Successfully deleted'})
      })
      .catch(e => next(e))
    }
  },
}
