const mongoose = require('mongoose')
const { registerSchema } = require('swaggiffy')

const likeSchema = new mongoose.Schema({
    user: {
        type: String,
    },
    post: {
        type: String,
    },
    date: {
        type: Date,
    },
    like: {
        type: Boolean,
        default: false
    }

})

registerSchema('Like', likeSchema, { orm: 'mongoose' })


module.exports.likeSchema = mongoose.model("likes", likeSchema)
