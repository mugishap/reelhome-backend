const { storySchema } = require('../models/story');
const { userSchema } = require('../models/user');
const { commentSchema } = require('../models/comment');
const { likeSchema } = require('../models/like');
const { postSchema } = require('../models/post');
const { followSchema } = require('../models/follow');

exports.newStory = (req, res) => {
    const newStory = await new storySchema({
        posterID: req.body.posterID,
        story_url: req.body.story_url,
        background_color: req.body.background_color,
        text_color: req.body.text_color,
        likes: req.body.likes,
        created_at: req.body.created_at,
    });
    await newStory.save()
    if (!newStory) {
        return res.status(400).json({ error: 'Could not create new story' })
    }
    return res.status(200).json({ newStory })
}
exports.getAllStories = (req, res) => {
    const stories = storySchema.find()
    return res.status(200).json({ stories })
}

exports.getStoriesByFollowing = async (req, res) => {
    const userID = req.params.userID;
    const following = await followSchema.find({ followerID: userID });
    const followingIDs = following.map(follow => follow.followingID);
    const stories = await storySchema.find({ posterID: { $in: followingIDs } });
    return res.status(200).json({ stories });
}

exports.getStoriesByUserID = async (req, res) => {
    const userID = req.params.userID;
    const stories = await storySchema.find({ posterID: userID });
    return res.status(200).json({ stories });
}
