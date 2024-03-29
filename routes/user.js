const express = require("express");
const { registerDefinition } = require("swaggiffy");
const { updateAllProfile, registerUser, getUserByQuery, allUsers, updateUser, deleteUser, login, updatePassword, unfollowUser, updateBiography, updateProfilePicture, followPerson, followUser, updateCoverPicture, userSuggestions, getUserById, getFollowingData, getFollowersData, getFollowData } = require("../controllers/user");
const userRouter = express.Router()
const { checkForAccess } = require('./../middlewares/auth')

userRouter.post("/new", registerUser);
userRouter.get('/getUserByName/:query', checkForAccess, getUserByQuery)
userRouter.get('/all', checkForAccess, allUsers)
userRouter.put('/update', checkForAccess, updateUser)
userRouter.post('/login', login)
userRouter.delete('/delete', checkForAccess, deleteUser)
userRouter.patch('/updatePassword', checkForAccess, updatePassword)
userRouter.patch('/updateProfilePicture', checkForAccess, updateProfilePicture)
userRouter.post('/follow', checkForAccess, followUser)
userRouter.patch('/updateBiography', checkForAccess, updateBiography)
userRouter.patch('/updateCover', checkForAccess, updateCoverPicture)
userRouter.get('/suggestedUsers', checkForAccess, userSuggestions)
userRouter.get('/getUserByID/:id', checkForAccess, getUserById)
userRouter.get('/getFollowingData', checkForAccess, getFollowingData)
userRouter.get('/getFollowersData', checkForAccess, getFollowersData)
userRouter.patch('/updateAllAspects', checkForAccess, updateAllProfile)
userRouter.get('/followdata/:userID',checkForAccess,getFollowData)

registerDefinition(userRouter, { tags: 'Users', mappedSchema: 'User', basePath: '/user' })

module.exports = userRouter;
