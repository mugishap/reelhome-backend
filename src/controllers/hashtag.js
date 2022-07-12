require('dotenv').config()

const express = require('express')
const hashtagSchema = require('../models/hashtags')
const { registerDefinition } = require('swaggiffy')

exports.newHashtag = async (req, res) => {

    const newHashtag = await new hashtagSchema({
        hashtag: req.body.hashtag,
        postID: req.body.postID,
        commentID: req.body.commentID,
        created_at: req.body.created_at,
    });
    await newHashtag.save()
    if(!newHashtag) {
        return res.status(400).json({ error: 'Could not create new hashtag' })
    }
    return res.status(200).json({newHashtag})

}

exports.getAllHashtags = async (req, res) => {
    const hashtags = await hashtagSchema.find()
    if(!hashtags) {
        return res.status(400).json({ error: 'Could not find hashtags' })
    }
    return res.status(200).json({hashtags})
}
