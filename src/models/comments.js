const mongoose = require('mongoose')
const { registerSchema } = require('swaggiffy')

const commentSchema = new mongoose.Schema({
    user:{
        type:String,
    },
    post:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now()
    },
    comment:{
        type:String,
        minlength:1,
        maxlength:200,
    }
})

registerSchema('Comment', commentSchema, { orm: 'mongoose' })


module.exports.commentSchema = mongoose.model("comments",commentSchema)
