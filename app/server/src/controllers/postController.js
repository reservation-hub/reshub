const { isValidObjectId } = require('mongoose')
const db = require('../db/mongoose')
const Post = require('../models/post')
const { CrudController } = require('./crudController')

exports.postIndex =  (req, res) => {
    // const {data: posts, status} =  Post.fetchAll() || {}
    // console.log('posts : ', posts)
    // console.log(Post.fetchAll())
    // // console.log(posts)
    // res.send({})
    Post.find({}).exec()
    .then(posts => {
        if (!posts.length) {
            return res.status(404).send({message: 'No post found!'})
        }
        res.send(posts)
    })
    .catch(e => res.status(500).send(e))
}

exports.postShow = (req, res) => {
    const { id } = req.params
    // if (!isValidObjectId(id)) {
    //     res.status(404).send({message: 'Invalid ID'})
    // }
    Post.show(id)
    .then(result => {
        res.send(result)
    })
    .catch(e => res.status(500).send(e))
    // Post.findById(id).exec()
    // .then(post => {
    //     if (!post) {
    //         return res.status(404).send({message: 'No post found!!!'})
    //     }
    //     res.send(post)
    // })
    // .catch(e => res.status(500).send(e))
}

exports.postInsert = (req, res) => {
    const { title, name, message } = req.body
    const post = new Post({title, name, message})
    post.save()
    .then(result => res.status(201).send(result))
    .catch(e => res.status(500).send(e))
}

exports.postUpdate = (req, res) => {
    const { id, title, name, message } = req.body
    Post.findById(id).exec()
    .then(result => {
        if (!result) {
            return res.status(404).send({message: "No post found!"})
        }
        result.setParams({title, name, message})
        result.save()
        .then(post => res.status(201).send(post))
        .catch(e => res.status(500).send(e))
    })
    .catch(e => res.status(500).send(e))
}

exports.postDelete = (req, res) => {
    const { id:_id } = req.body
    Post.deleteOne({_id}).exec()
    .then(result => {
        if (!result.deletedCount) {
            return res.status(404).send({message: 'No post matched!'})
        }
        res.send(result)
    })
    .catch(e => res.status(500).send(e))
}