const Joi = require('joi')

exports.signupSchema = Joi.object().keys({
    fullname: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),

})

exports.loginSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})

exports.createPostSchema = Joi.object().keys({
    caption: Joi.string().required(),
    imageStr: Joi.string().required(),
})

exports.updatePostSchema = Joi.object().keys({
    caption: Joi.string().required(),
    imageStr: Joi.string().required(),
})

exports.updateUserSchema = Joi.object().keys({
    fullname: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
})

exports.updatePasswordSchema = Joi.object().keys({
    password: Joi.string().required(),
    newPassword: Joi.string().required(),
})
exports.updateProfilePictureSchema = Joi.object().keys({
    imageStr: Joi.string().required(),
})
exports.updateCoverPictureSchema = Joi.object().keys({
    imageStr: Joi.string().required(),
})
exports.deleteUserSchema = Joi.object().keys({
    password: Joi.string().required(),
})

