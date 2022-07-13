const mongoose = require('mongoose')
const { registerSchema } = require('swaggiffy')

const postSchema = new mongoose.Schema({
    created: {
        type: String
    },
    user: {
        type: String
    },
    image_url: {
        type: String
    },
    likes: {
        type: Number,
        default:0
    },
    comments: {
        type: Number,
        default:0
    },
    date: {
        type: Date,
        default: new Date()

    },
    caption: {
        type: String,
        maxlength: 700,
        minlength: 0
    }
})

// registerSchema('Post', postSchema, { orm: 'mongoose' })


module.exports.postSchema = mongoose.model("posts", postSchema)
