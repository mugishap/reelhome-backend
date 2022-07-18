const { userSchema } = require("../models/user")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { followSchema } = require("../models/follows")
const { isString, isInteger } = require("lodash")
const cloudinary = require('cloudinary').v2
const { signupSchema, updateAllSchema, loginSchema, updateUserSchema, updatePasswordSchema } = require("./../utils/validate")

require('dotenv').config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

exports.registerUser = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body

        const { error, value } = signupSchema.validate(req.body)

        if (error) return res.status(400).json({ message: error.message })

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

        const { error, value } = loginSchema.validate(req.body)

        if (error) return res.status(400).json({ message: error.message })

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

        const { error, value } = updateUserSchema.validate(req.body)

        if (error) return res.status(400).json({ message: error.message })

        const user = await userSchema.findOne({ _id: req.user.userid })
        console.log(req.user.userid);

        if (!user || user === null) return res.status(400).json({ message: "User not found" })
        await userSchema.findByIdAndUpdate(user._id, {
            fullname,
            username,
            email,
        })
        return res.status(200).json({ message: "User updated successfully" })
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

        const following = await followSchema.find({ follower: user._id })
        const followers = await followSchema.find({ user: user._id })
        if (following) {
            following.forEach(async (follow) => {
                await followSchema.findByIdAndDelete(follow._id)
                const followed = await userSchema.findById(follow.user)
                followed.followers -= 1
                await followed.save()

            }
            )
        }
        if (followers) {
            followers.forEach(async (follow) => {
                await followSchema.findByIdAndDelete(follow._id)
                const follower = await userSchema.findById(follow.follower)
                follower.following -= 1
                await follower.save()
            }
            )
        }

        const posts = await postSchema.find({ user: user._id })
        if (posts) {
            posts.forEach(async (post) => {
                await postSchema.findByIdAndDelete(post._id)
            }
            )
        }

        const comments = await commentSchema.find({ user: user._id })
        if (comments) {
            comments.forEach(async (comment) => {
                await commentSchema.findByIdAndDelete(comment._id)
            }
            )
        }
        const likes = await likeSchema.find({ user: user._id })
        if (likes) {
            likes.forEach(async (like) => {
                await likeSchema.findByIdAndDelete(like._id)
            }
            )
        }

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
        const { user, status } = req.body
        const follower = req.user.userid
        if (status.toLowerCase() === 'follow') {
            const verifyUser = await userSchema.findOne({ _id: user })
            const verifyFollower = await userSchema.findOne({ _id: follower })

            if (!verifyUser === null) return res.status(400).json({ message: "User to be followed not found" })
            if (!verifyFollower === null) return res.status(400).json({ message: "User to follow not found" })

            const newfollower = new followSchema({
                follower,
                user,
            })
            await newfollower.save()

            verifyFollower.following = verifyFollower.following + 1
            await verifyFollower.save()

            verifyUser.followers = verifyUser.followers + 1
            await verifyUser.save()
            return res.status(200).json({ message: "You are now following this user" })
        } else if (status.toLowerCase() === 'unfollow') {
            const verifyUser = await userSchema.findOne({ _id: user })
            const verifyFollower = await userSchema.findOne({ _id: follower })

            if (!verifyUser === null) return res.status(400).json({ message: "User to be unfollowed not found" })
            if (!verifyFollower === null) return res.status(400).json({ message: "User to unfollow not found" })

            const verifyIfFollowing = await followSchema.findOne({ follower, user })
            if (!verifyIfFollowing) return res.status(400).json({ message: "You are not following this user" })
            await followSchema.findByIdAndDelete(verifyIfFollowing._id)

            verifyFollower.following = verifyFollower.following - 1
            await verifyFollower.save()

            verifyUser.followers = verifyUser.followers - 1
            await verifyUser.save()
            return res.status(200).json({ message: "You are no longer following this user" })
        }
        if(!status) return res.status(400).json({message:"Error, try again later!!"})
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({ message: "Error in following user" })
    }


}


exports.updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body

        const { error, value } = updatePasswordSchema.validate(req.body)

        if (error) return res.status(400).json({ message: error.message })


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

        const { error, value } = this.updateProfilePicture.validate(req.body)

        if (error) return res.status(400).json({ message: error.message })

        const user = await userSchema.findById(req.user.userid)
        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })
        const uploadedReponse = await cloudinary.uploader.upload(imageStr, {
            upload_preset: "reelhome"
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
        const { error, value } = updateProfilePicture.validate(req.body)

        if (error) return res.status(400).json({ message: error.message })

        const user = await userSchema.findById(req.user.userid)
        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })
        const uploadedReponse = await cloudinary.uploader.upload(imageStr, {
            upload_preset: "reelhome"
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

        const { error, value } = this.updateBiography.validate(req.body)

        if (error) return res.status(400).json({ message: error.message })

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


exports.updateAllProfile = async (req, res) => {
    try {
        const { cover, profile, fullname, username, email } = req.body
        const { error, value } = updateAllSchema.validate(req.body)
        if (error) return res.status(400).json({ message: error.message })
        const user = req.user.userid
        const userData = await userSchema.findOne({ user })
        if (!userData) return res.status(400).json({ message: "User not found" })
        const coverUploadResponse = await cloudinary.uploader.upload(cover, {
            resource_type: 'image',
            upload_preset: 'reelhome'
        })
        const coverURL = coverUploadResponse.secure_url
        const profileUploadResponse = await cloudinary.uploader.upload(profile, {
            resource_type: 'image',
            upload_preset: 'reelhome'
        })
        const profileURL = profileUploadResponse.secure_url

        await cloudinary.uploader.destroy(userData.cover.split('/').pop())
        await cloudinary.uploader.destroy(userData.profile.split('/').pop())

        await userSchema.findByIdAndUpdate(user, {
            cover: coverURL,
            profile: profileURL,
            fullname,
            username,
            email
        })
        return res.status(200).json({ message: "Profile updated successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
    }
}

exports.userSuggestions = async (req, res) => {
    try {
        const userid = req.user.userid
        const user = await userSchema.findById(userid)
        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })
        const following = await followSchema.find({ follower: userid })
        const suggestions = await userSchema.find({ $and: [{ _id: { $nin: following } }, { _id: { $ne: userid } }] })
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
exports.getFollowingData = async (req, res) => {
    try {
        const userid = req.user.userid
        const user = await userSchema.findById(userid)
        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })
        const following = await followSchema.find({ follower: userid })
        const users = await userSchema.find({ _id: { $in: following } })
        return res.status(200).json({ users })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in getting user suggestions" })
    }
}
exports.getFollowersData = async (req, res) => {
    try {
        const userid = req.user.userid
        const user = await userSchema.findById(userid)
        if (!user || user === null) return res.status(400).json({ message: "You are not logged in" })
        const followers = await followSchema.find({ user: userid })
        const users = await userSchema.find({ _id: { $in: followers } })
        return res.status(200).json({ users, followers })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in getting user suggestions" })
    }
}
exports.getFollowData = async (req, res) => {
    try {
        const { userID } = req.params
        const user = await userSchema.findById(userID)
        if (!user || user === null) return res.status(400).json({ message: "User not found" })

        const followers = await followSchema.find({ user: userID })
        const following = await followSchema.find({ follower: userID })
        const followersIdArray = followers.map(follower => follower.follower)
        const followingIdArray = following.map(following => following.user)
        const buttonText = followersIdArray.includes(req.user.userid) ? "Unfollow" : "Follow"
        return res.status(200).json({ followers, following, followersIdArray,buttonText, followingIdArray })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in getting user follow data" })
    }
}
