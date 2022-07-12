const mongoose = require('mongoose')
const { registerSchema } = require('swaggiffy')

const followSchema = new mongoose.Schema({
    user:{
        type:String,
    },
    follower:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now()
    }

})


registerSchema('Follow', followSchema, { orm: 'mongoose' })


module.exports.followSchema = mongoose.model("follows",followSchema)
