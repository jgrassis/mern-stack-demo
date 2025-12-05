const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   POST api/posts
// @desc    Create a Post
// @access  Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error({ msg: errors });
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      const post = new Post(newPost);
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.sendStatus(500);
    }
  }
);

// @route   GET api/posts
// @desc    Get all Posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

// @route   GET api/posts/post/:post_id
// @desc    Get Post by ID
// @access  Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.sendStatus(500);
  }
});

// @route   DELETE api/posts/post/:post_id
// @desc    Delete Post by ID
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    // Check if post is found
    if (!post) {
      console.error('Post not found');
      return res.status(404).json({ msg: 'Post not found' });
    }
    // Confirm user is owner of Post to be deleted
    if (post.user.toString() !== req.user.id) {
      console.error('Unauthorized to delete this post');
      return res
        .status(401)
        .json({ msg: 'User is not authorized to delete this post' });
    }
    // Delete the post
    await post.deleteOne();
    console.log(`Post ${post} deleted`);
    return res.json({ msg: `Post ${req.params.post_id} Deleted` });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.sendStatus(500);
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Check if post is alredy liked by user
    const postLikes = post.likes.filter(
      (like) => like.user.toString() === req.user.id
    );
    if (postLikes.length > 0) {
      console.log(`Already liked post ${req.params.id}, time to unlike it`);
      post.likes = post.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
      await post.save();
      return res.json(post.likes);
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

// @route   POST api/posts/comment/:post_id
// @desc    Add Comment to a Post
// @access  Private
router.post(
  '/comment/:post_id',
  [auth, [check('text', 'Comment text is required').not().isEmpty()]],
  async (req, res) => {
    // Check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Find user by User ID
      const user = await User.findById(req.user.id).select('-password');
      // Find post by post_id
      const post = await Post.findById(req.params.post_id);
      // Construct the Comment Object
      const comment = {
        text: req.body.text,
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
      };
      // Make sure the post exists
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
      // Add the comment to the post.comments array
      post.comments.unshift(comment);
      // Save it and send it
      await post.save();
      return res.json(post.comments);
    } catch (err) {
      console.log(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found' });
      }
      return res.sendStatus(500);
    }
  }
);

// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    Delete Comment from Post
// @access  Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    // Find user and post
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.post_id);

    // Return "not found" if post doesn't exist
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Get the comment object
    const comment = post.comments.find((comment) => {
      return comment.id === req.params.comment_id;
    });

    // make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    // Make sure user is owner of comment
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'Unauthorized to delete this comment' });
    }

    // Filter out the comment based on the Comment ID
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);

    // Save and respond
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.log(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.sendStatus(500);
  }
});

module.exports = router;
