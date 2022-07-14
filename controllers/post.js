const express = require('express')
const { postSchema } = require('../models/posts')
const { likeSchema } = require('../models/likes')
const { commentSchema } = require('../models/comments')
const cloudinary = require('cloudinary').v2
require('dotenv').config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.newPost = async (req, res) => {
    try {
        const { videoStr, caption } = req.body
        user = req.user.userid
        const uploadedResponse = await cloudinary.uploader.upload(videoStr, {
            upload_preset: 'reelhome'
        })
        const video_url = uploadedResponse.secure_url
        const post = new postSchema({
            user,
            video_url,
            caption,
        })
        await post.save()
        const posts = await postSchema.find()
        if (!post) return res.status(400).json({ message: "POST NOT CREATED", post, posts })
        return res.status(200).json({ message: "Post created succesfully" })
    } catch (error) {
        console.log(`[LOG]Error: ${error}`);
    }
}

exports.allPosts = async (req, res) => {
    const posts = await postSchema.find()
    if (!posts || posts === null) return res.status(400).json({ message: "No posts found" })
    return res.status(200).json({ posts })
}
exports.deletePost = async (req, res) => {
    const { postID } = req.params
    const { video_url } = await postSchema.findById(postID)
    const post = await postSchema.findByIdAndDelete(postID)
    if (!post || post === null) return res.status(400).json({ message: "Post not found" })
    await cloudinary.uploader.destroy(video_url.split('/').pop())
    await likeSchema.deleteMany({ post: postID })
    await commentSchema.deleteMany({ post: postID })
    const likedata = await likeSchema.find({ post: postID })
    const likecount = likedata.length
    return res.status(200).json({ message: "Post deleted succesfully", likedata, likecount })
}

exports.commentOnPost = async (req, res) => {
    const { postID, comment } = req.body
    const user = req.user.userid
    const post = await postSchema.findById(postID)
    if (!post || post === null) return res.status(400).json({ message: "Post not found" })
    const commentOnPost = await new commentSchema({
        user,
        comment,
        post: postID
    })
    await commentOnPost.save()
    const comments = await commentSchema.find({ post: postID })
    await postSchema.findByIdAndUpdate(postID, { $inc: { comments: 1 } })
    return res.status(200).json({ message: "Comment created succesfully", comments })
}
exports.likePost = async (req, res) => {
    const { postID } = req.params
    const user = req.user.userid
    const post = await postSchema.findById(postID)
    if (!post || post === null) return res.status(400).json({ message: "Post not found" })
    const verifyLike = await likeSchema.findOne({ post: postID, user: user })
    if (verifyLike) return res.status(400).json({ message: "You already liked this post" })
    const likeOnPost = new likeSchema({
        user,
        post: postID
    })
    await likeOnPost.save()
    await postSchema.findByIdAndUpdate(postID, { $inc: { likes: 1 } })
    const likedata = await likeSchema.find({ post: postID })
    const likecount = likedata.length
    return res.status(200).json({ message: "Like created succesfully", likedata, likecount })
}
exports.getPostByPosterID = async (req, res) => {
    const { posterID } = req.params
    const posts = await postSchema.find({ user: posterID })
    if (!posts || posts === null) return res.status(400).json({ message: "No posts found" })
    return res.status(200).json({ posts })
}
exports.getPostsByMostLikes = async (req, res) => {
    const posts = await postSchema.find().sort({ likes: desc })
    if (!posts || posts === null) return res.status(400).json({ message: "No posts found" })
    return res.status(200).json({ posts })
}
exports.getPostsByMostComments = async (req, res) => {
    const posts = await postSchema.find().sort({ comments: desc })
    if (!posts || posts === null) return res.status(400).json({ message: "No posts found" })
    return res.status(200).json({ posts })
}
exports.getCommentsByPosts = async (req, res) => {
    const { postID } = req.params
    const comments = await commentSchema.find({ post: postID })
    if (!comments || comments === null) return res.status(400).json({ message: "No comments found" })
    return res.status(200).json({ comments })
}
exports.getLikesDataByPosts = async (req, res) => {
    const { postID } = req.params
    const likedata = await likeSchema.find({ post: postID })
    if (!likedata || likedata === null) return res.status(400).json({ message: "No likes found" })
    return res.status(200).json({ likedata })
}
exports.getLikesCountByPosts = async (req, res) => {
    const { postID } = req.params
    const likedata = await likeSchema.find({ post: postID })
    if (!likedata || likedata === null) return res.status(400).json({ message: "No likes found" })
    const likecount = likedata.length
    return res.status(200).json({ likedata, likecount })
}
exports.getCommentsByUser = async (req, res) => {
    const { userID } = req.params
    const comments = await commentSchema.find({ user: userID })
    if (!comments || comments === null) return res.status(400).json({ message: "No comments found" })
    return res.status(200).json({ comments })
}
exports.unLikePost = async (req, res) => {
    const { postID } = req.params
    const user = req.user.userid
    const post = await postSchema.findById(postID)
    if (!post || post === null) return res.status(400).json({ message: "Post not found" })
    const likeOnPost = await likeSchema.findOne({ post: postID, user })
    if (!likeOnPost || likeOnPost === null) return res.status(400).json({ message: "No like found" })
    await likeSchema.findByIdAndDelete(likeOnPost._id)
    await postSchema.findByIdAndUpdate(postID, { $inc: { likes: -1 } })
    const likedata = await likeSchema.find({ post: postID })
    const likecount = likedata.length
    return res.status(200).json({ message: "Like deleted succesfully", likedata, likecount })
}
exports.updateCommentOnPost = async (req, res) => {
    const { postID } = req.params
    const { commentID, comment } = req.body
    const user = req.user.userid
    const post = await postSchema.findById(postID)
    if (!post || post === null) return res.status(400).json({ message: "Post not found" })
    const commentOnPost = await commentSchema.findById(commentID)
    if (!commentOnPost || commentOnPost === null) return res.status(400).json({ message: "Comment not found" })
    await commentSchema.findByIdAndUpdate(commentID, { user, comment })
    const comments = await commentSchema.find({ post: postID })
    return res.status(200).json({ message: "Comment updated succesfully", comments })
}
exports.updatePost = async (req, res) => {
    const { postID } = req.params
    const { caption, videoStr } = req.body
    const user = req.user.userid
    const post = await postSchema.findById(postID)
    if (!post || post === null) return res.status(400).json({ message: "Post not found" })
    if (user != post.user) return res.status(400).json({ message: "You are not authorized to update this post" })

    let video_url = null
    if (videoStr) {
        const uploadedResponse = await cloudinary.v2.uploader.upload(videoStr, {
            upload_preset: 'reelhome',
        })
        video_url = uploadedResponse.secure_url
    }

    await postSchema.findByIdAndUpdate(postID, { caption, video_url })
    const posts = await postSchema.find()
    return res.status(200).json({ message: "Post updated succesfully", posts })
}
exports.getPostsByFollowing = async (req, res) => {
    const userID = req.user.userid
    const following = await followSchema.find({ follower: userID })
    if (!following || following === null) return res.status(400).json({ message: "The user does not follow anyone yet" })
    const posts = await postSchema.find({ user: { $in: following.map(follow => follow.following) } })
    if (!posts || posts === null) return res.status(400).json({ message: "No posts found from the people you follow" })
    return res.status(200).json({ posts })
}
exports.getAllPostData = async (req, res) => {
    const { postID } = req.params
    const post = await postSchema.findById(postID)
    if (!post || post === null) return res.status(400).json({ message: "Post not found" })
    const comments = await commentSchema.find({ post: postID })
    if (!comments || comments === null) return res.status(400).json({ message: "No comments found" })
    const likes = await likeSchema.find({ post: postID })
    if (!likes || likes === null) return res.status(400).json({ message: "No likes found" })
    return res.status(200).json({ post, comments, likes })
}
exports.deleteComment = async (req, res) => {
    const { postID } = req.params
    const { commentID } = req.body
    const user = req.user.userid
    const comment = await commentSchema.findById(commentID)
    if(user != comment.user) return res.status(400).json({ message: "You are not authorized to delete this comment" })
    if (!comment || comment === null) return res.status(400).json({ message: "Comment not found" })
    await commentSchema.findByIdAndDelete(commentID)
    const posts = await postSchema.findById(postID)
    if (!posts || posts === null) return res.status(400).json({ message: "Post not found" })
    await postSchema.findByIdAndUpdate(postID, { $inc: { comments: -1 } })
    const comments = await commentSchema.find({ post: comment.post })
    return res.status(200).json({ message: "Comment deleted succesfully", comments })
}
