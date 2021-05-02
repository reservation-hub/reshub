const { models, isValidObjectId } = require("mongoose")

class CrudController {
    constructor(model) {
        this.model = model
    }

    index(req, res) {
        this.model.find({}).exec()
        .then(models => {
            if (!models.length) {
                return res.status(404).send({message: 'error'})
            }
            res.send(models)
        })
        .catch(e => res.status(500).send(e))
    } 

    show(req, res) {
        console.log('SHOW SHOW SHOW')
        const { id } = req.params
        if (!isValidObjectId(id)) {
            res.status(404).send({message: 'Invalid ID'})
        }
        this.model.findById(id).exec()
        .then(model => {
            if (!model) {
                return res.status(404).send({message: 'err'})
            }
            res.send(model)
        })
        .catch(e => res.status(500).send(e))
    }

    insert(req, res) {
        const { title, name, message } = req.body
        const model = new this.model({title, name, message})
        post.save()
        .then(result => res.status(201).send(result))
        .catch(e => res.status(500).send(e))
    }
}

module.exports = { CrudController }