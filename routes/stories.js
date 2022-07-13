const {storySchema} = require('../models/story');
const {userSchema} = require('../models/user');
const {commentSchema} = require('../models/comment');
const {likeSchema} = require('../models/like');
const {postSchema} = require('../models/post');
const {followSchema} = require('../models/follow');
const { checkForAccess } = require('../middlewares/auth');
const { newStory, getStoriesByFollowing } = require('../controllers/stories');
const { registerDefinition } = require('swaggiffy');

const storyRouter = express.Router();

storyRouter.post('/newStory', checkForAccess,newStory)
storyRouter.get('/getAllStories', checkForAccess,getAllStories)
storyRouter.get('/getStoriesByFollowing/:userID', checkForAccess,getStoriesByFollowing)
storyRouter.get('/getStoriesByUserID/:userID', checkForAccess,getStoriesByUserID)

registerDefinition(storyRouter, { tags: 'Stories', mappedSchema: 'Story', basePath: '/story' })

module.exports = storyRouter;
