const Joi = require('joi')

exports.signupSchema = Joi.object({
    fullname: Joi.string().max(100).min(4).required(),
    username: Joi.string().required().max(16).min(3),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(4).max(16),

})

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})

exports.createPostSchema = Joi.object({
    caption: Joi.string().required().max(400),
    videoStr: Joi.string().required(),
})

exports.updatePostSchema = Joi.object({
    caption: Joi.string().required(),
    videoStr: Joi.string().required(),
})

exports.updateUserSchema = Joi.object({
    fullname: Joi.string().max(100).min(4).required(),
    username: Joi.string().required().max(16).min(3),
    email: Joi.string().email().required(),
})

exports.updatePasswordSchema = Joi.object({
    password: Joi.string().required().min(4).max(16),
    newPassword: Joi.string().required().min(4).max(16),
})
exports.updateProfilePictureSchema = Joi.object({
    imageStr: Joi.string().required(),
})
exports.updateCoverPictureSchema = Joi.object({
    imageStr: Joi.string().required(),
})
exports.deleteUserSchema = Joi.object({
    password: Joi.string().required().min(4).max(16),
})

exports.updateBiographySchema = Joi.object({
    biography: Joi.string().required().max(300).min(3),
})
exports.updateAllSchema = Joi.object({
    profile:Joi.string().required(),
    cover:Joi.string().required(),
    fullname: Joi.string().max(100).min(4).required(),
    username: Joi.string().required().max(16).min(3),
    email: Joi.string().email().required(),
})
