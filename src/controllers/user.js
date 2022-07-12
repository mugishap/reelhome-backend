const userSchema = require('../models/user')
const postSchema = require('../models/posts')
const commentSchema = require('../models/comments')
const likeSchema = require('../models/likes')
const followSchema = require('../models/follows')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
require('dotenv').config()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})


exports.registerUser = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body

        //Validations for the user using valdie
        if (!isString(fullname) || fullname < 5 || fullname > 100) return res.status(400).json({ message: "Fullname must be a string, less than 100 and greater than 5" })
        if (!isAlphaNum(username)||username < 3 || username > 10) return res.status(400).json({ message: "Username must be a string, less than 50 and greater than 4" })
        if (!isEmail(email) || email < 6 || email > 50) return res.status(400).json({ message: "Email must be a valid email, less than 50 and greater than 6" })
        if (password < 4 || password > 16) return res.status(400).json({ message: "Password must be a string, greater than 4,and less than 16 characters" })

        const anotherUsername = await userSchema.findOne({ username })
        const anotherEmail = await userSchema.findOne({ email })

        if (anotherUsername != null) return res.status(400).json({ message: "User with that username already exists" })
        if (anotherEmail != null) return res.status(400).json({ message: "User with that email already exists" })



        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))
        const user = new userSchema({
            fullname,
            username,
            email,
            followers: 0,
            following: 0,
            password: hashedPassword,
        })

        if (!user) return res.status(400).json("ACCOUNT NOT CREATED")
        else {
            console.log('Account created succesfully!!')
            await user.save()
            return res.status(201).json({ message: "Account created", user })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in creating your account" })
    }
}

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params
        const user = await userSchema.findById(id)
        if (!user || user === null) return res.status(400).json({ message: "User not found" })
        return res.status(200).json({ user })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in getting user by ID" })
    }
}
exports.getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params
        const user = await userSchema.findOne({ username: username })
        if (!user || user === null) return res.status(400).json({ message: "User not found" })
        return res.status(200).json({ user })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in getting user by Username" })
    }
}
exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params
        const user = await userSchema.findOne({ email: email })
        if (!user || user === null) return res.status(400).json({ message: "User not found" })
        return res.status(200).json({ user })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in getting user by email" })
    }
}

exports.getUserByQuery = async (req, res) => {
    try {
        const { query } = req.params
        const users = await userSchema.find({ $or: [{ username: (new RegExp(`${query}`)) }, { email: (new RegExp(`${query}`)) }, { fullname: (new RegExp(`${query}`)) }] })
        if (!users || users === null) return res.status(400).json({ message: "Users not found" })
        return res.status(200).json({ users })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in getting users" })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!isEmail(email)) return res.status(400).json({ message: "Email must be a valid email, less than 50 and greater than 6" })
        if (!isString(password) || password < 4 || password > 16) return res.status(400).json({ message: "Password must be a string, greater than 4,and less than 16 characters" })

        const user = await userSchema.findOne({ email })
        if (!user || user === null) return res.status(400).json({ message: "User not found" })
        const comparison = await bcrypt.compareSync(password, user.password, (err, res) => {
            if (err) console.log("Error in comparing password please try again")
        })
        if (comparison) {
            const token = jwt.sign({ userid: user._id }, process.env.TOKEN_SECRET)
            if (!token) return res.status(400).json({ message: "No token generated try logging in again" })
            console.log('token', token);
            return res.status(200).json({ token, message: "Can continue", user })
        } else {
            return res.status(400).json({ message: "Wrong login info" })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in logging you in" })
    }
}

exports.updateUser = async (req, res) => {
    try {

        const { fullname, username, email } = req.body

        if (!isString(fullname)) return res.status(400).json({ message: "Fullname must be a string" })
        if (!isString(username)) return res.status(400).json({ message: "Username must be a string" })
        if (!isEmail(email)) return res.status(400).json({ message: "Email must be a valid email" })

        const user = await userSchema.findOne({ _id: req.user.userid })
        console.log(req.user.userid);

        if (!user || user === null) return res.status(400).json({ message: "User not found" })
        await userSchema.findByIdAndUpdate(user._id, {
            fullname,
            username,
            email,
        })
        return res.status(200).json({ message: "updated successfully" })
    } catch (error) {
        console.log(error.message);
        const message = error.message.match(/(\w+)\sdup key/i)[1]
        switch (message) {
            case 'username_1':
                return res.status(400).json({ message: "Error in updating user", error: "Username already exists" })

            case 'email_1':
                return res.status(400).json({ message: "Error in updating user", error: "Email already exists" })

            default:
                return res.status(400).json({ message: "Error in updating user", error: message })
        }
    }
}


exports.deleteUser = async (req, res) => {
    try {
        const user = await userSchema.findById(req.user.userid)
        if (!user || user === null) return res.status(400).json({ message: "User not found" })

        const isMatch = await bcrypt.compareSync(req.body.password, user.password)

        if (!isMatch) return res.status(400).json({ message: "Wrong password" })

        await userSchema.findByIdAndDelete(user._id)

        return res.status(200).json({ message: "Account deleted successfully" })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in deleting user" })
    }
}
exports.allUsers = async (req, res) => {
    try {
        const users = await userSchema.find({})
        return res.status(200).json({
            count: users.length,
            data: users
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in getting users" })
    }
}

exports.followUser = async (req, res) => {
    try {
        const { follower, user } = req.body

        const verifyUser = await userSchema.findOne({ _id: user })
        const verifyFollower = await userSchema.findOne({ _id: follower })

        if (!verifyUser === null) return res.status(400).json({ message: "User to be followed not found" })
        if (!verifyFollower === null) return res.status(400).json({ message: "User to follow not found" })

        const verifyIfFollowing = await followSchema.findOne({ follower, user })
        if (verifyIfFollowing) return res.status(400).json({ message: "You are already following this user" })
        const newfollower = new followSchema({
            follower,
            user,
        })
        await newfollower.save()
        verifyFollower.followers = verifyFollower.followers + 1
        await verifyFollower.save()
        verifyUser.following = verifyUser.following + 1
        await verifyUser.save()
        return res.status(200).json({ message: "You are now following this user" })
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({ message: "Error in following user" })
    }


}

exports.unfollowUser = async (req, res) => {
    try {
        const { follower, user } = req.body

        const verifyUser = await userSchema.findOne({ _id: user })
        const verifyFollower = await userSchema.findOne({ _id: follower })

        if (!verifyUser === null) return res.status(400).json({ message: "User to be followed not found" })
        if (!verifyFollower === null) return res.status(400).json({ message: "User to follow not found" })

        const verifyIfFollowing = await followSchema.findOne({ follower, user })
        if (!verifyIfFollowing) return res.status(400).json({ message: "You are not following this user" })

        await followSchema.findByIdAndDelete(verifyIfFollowing._id)
        verifyFollower.followers = verifyFollower.followers - 1
        await verifyFollower.save()
        verifyUser.following = verifyUser.following - 1
        await verifyUser.save()
        return res.status(200).json({ message: "You are no longer following this user" })
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({ message: "Error in unfollowing user" })
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body

        if (password === newPassword) return res.status(400).json({ message: "New password must be different from old password" })

        if (!isString(password) || password < 4 || password > 16) return res.status(400).json({ message: "Password must be a string, greater than 4,and less than 16 characters" })
        if (!isString(newPassword) || password < 4 || password > 16) return res.status(400).json({ message: "Password must be a string, greater than 4,and less than 16 characters" })

        const user = await userSchema.findById(req.user.userid)

        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })

        const comparison = await bcrypt.compareSync(password, user.password, (err, res) => {
            if (err) console.log("Error in comparing password please try again")
        })
        if (comparison) {
            const hashedPassword = await bcrypt.hashSync(newPassword, process.env.SALT_ROUNDS)
            user.password = hashedPassword
            await user.save()
            return res.status(200).json({ message: "Password updated successfully" })
        } else {
            return res.status(400).json({ message: "Wrong login info" })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in updating password" })
    }
}

exports.updateProfilePicture = async (req, res) => {
    try {
        const { imageStr } = req.body
        const user = await userSchema.findOne({ username: req.user.userid })
        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })
        const uploadedReponse = await cloudinary.uploader.upload(imageStr, {
            upload_preset: "photocorner"
        })
        user.profile = uploadedReponse.secure_url
        await user.save()
        return res.status(200).json({ message: "Profile picture updated successfully" })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in updating profile picture" })
    }
}

exports.updateCoverPicture = async (req, res) => {
    try {
        const { imageStr } = req.body
        const user = await userSchema.findById(req.userid)
        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })
        const uploadedReponse = await cloudinary.uploader.upload(imageStr, {
            upload_preset: "photocorner"
        })
        user.cover = uploadedReponse.secure_url
        await user.save()
        return res.status(200).json({ message: "Cover picture updated successfully" })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in updating cover picture" })
    }
}

exports.updateBiography = async (req, res) => {
    try {
        const { biography } = req.body
        if (!biography) return res.status(400).json({ message: "Biography cannot be empty" })
        if (biography.length > 300) return res.status(400).json({ message: "Biography is too long" })
        if (!isString(biography)) { return res.status(400).json({ message: "Biography is not a string" }) }
        const user = await userSchema.findById(req.user.userid)
        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })
        user.biography = biography
        await user.save()
        return res.status(200).json({ message: "Biography updated successfully" })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in updating biography" })
    }
}

exports.userSuggestions = async (req, res) => {
    try {
        const userid  = req.user.userid
        const user = await userSchema.findById(userid)
        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })
        const following = await followSchema.find({ follower: userid })
        const suggestions = await userSchema.find({ _id: { $nin: following } })
        //Function to shuffle array
        const shuffle = (array) => {
            var currentIndex = array.length, temporaryValue, randomIndex;
            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }
        const users = shuffle(suggestions)
        return res.status(200).json({ users })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in getting user suggestions" })
    }
}
