const {hashtagSchema} = require('../models/hashtags')
const {userSchema} = require('../models/user')
const {commentSchema} = require('../models/comment')
const {likeSchema} = require('../models/like')
const {postSchema} = require('../models/post')
const {followSchema} = require('../models/follow')
const { checkForAccess } = require('../middlewares/auth')
const { newHashtag, getAllHashtags } = require('../controllers/hashtags')
const { registerDefinition } = require('swaggiffy')

const hashtagRouter = express.Router()

hashtagRouter.post('/newHashtag', checkForAccess,newHashtag)
hashtagRouter.get('/getAllHashtags', checkForAccess,getAllHashtags)

registerDefinition(hashtagRouter, { tags: 'Hashtags', mappedSchema: 'Hashtag', basePath: '/hashtag' })

module.exports = hashtagRouter
