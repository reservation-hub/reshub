const mongoose = require('mongoose')
const { post } = require('../routes/posts')

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        }
    }, {
        timestamps: true,
    })

postSchema.methods.setParams = function(object) {
    for (const [key, value] of Object.entries(object)) {
        this[key] = value
    }
}

postSchema.statics = require('./crudSchema')

const Post = mongoose.model('Post', postSchema)

module.exports = Post