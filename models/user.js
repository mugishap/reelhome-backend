const mongoose = require('mongoose')
const { registerSchema } = require('swaggiffy')
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        maxlength: 100,
        minlength: 3
    },
    username: {
        type: String,
        maxlength: 16,
        minlength: 3,
        unique: true
    },
    profile: {
        type: String,
        default: 'https://www.innovaxn.eu/wp-content/uploads/blank-profile-picture-973460_1280.png'
    },
    cover: {
        type: String,
        default: 'https://marketplace.canva.com/EAENvp21inc/1/0/1600w/canva-simple-work-linkedin-banner-qt_TMRJF4m0.jpg'
    },
    email: {
        type: String,
        maxlength: 50,
        minlength: 6,
        unique: true
    },
    followers: {
        type: Number
    },
    following: {
        type: Number
    },
    password: {
        type: String,
    },
    biography: {
        type: String,
        maxlength: 300,
        minlength: 3,
        required: false
    }
})

registerSchema('User', userSchema, { orm: 'mongoose' })

module.exports.userSchema = mongoose.model("users", userSchema)
