const mongoose = require('mongoose')
const { Types: { ObjectId }} = mongoose

exports.crudController = {
    index(req, res, next, { Model }) {
        Model.find({}).exec()
        .then(models => {
            return res.send(models)
        })
        .catch(e => next(e))
    },
    show(req, res, next, { Model, id }) {
        if (!ObjectId.isValid(id)) return next({code: 404})
        Model.findById(id).exec()
        .then(model => {
            return res.send(model)
        })
        .catch(e => next(e))
    },
    insert(req, res, next, { Model }) {
        Model.save()
        .then(result => res.status(201).send(result))
        .catch(e => next(e))
    },
    update(req, res, next, { Model, id, params }) {
        if (!ObjectId.isValid(id)) return next({code: 404})
        Model.findByIdAndUpdate(id, params, {new: true, omitUndefined: true, runValidators: true}).orFail().exec()
        .then(model => {
            return res.send(model)
        })
        .catch(e => next(e))
    },
    delete(req, res, next, { Model, id }) {
        Model.findOneAndDelete({_id: id}).orFail().exec()
        .then(result => {
            return res.send({message: 'Successfully deleted'})
        })
        .catch(e => next(e))
    },
}
