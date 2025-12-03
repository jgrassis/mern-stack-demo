const router = require('express').Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      return res.status(400).json({ msg: "There's no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

// @route   POST api/profile/
// @desc    Create or update a user profile
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    // Check fields sent in req body
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Setup new object for Profile Fields, and associate the User ID with it
    const profileFields = {};
    profileFields.user = req.user.id;

    // Build profile object
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build socials object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    //
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Update an existing Profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      } else {
        // Create a new Profile
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.sendStatus(500);
    }
  }
);

// @route   GET api/profile/
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get Profile by User Id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.sendStatus(500);
  }
});

// @route   DELETE api/profile/user/
// @desc    Delete Profile, User, and Posts by User Id
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // @todo Remove User's posts

    // Remove Profile
    await Profile.findOneAndDelete({
      user: req.user.id,
    });

    // Remove User
    await User.findOneAndDelete({
      _id: req.user.id,
    });

    res.json({ msg: `User ${req.user.id} Deleted` });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.sendStatus(500);
  }
});

// @route   PUT api/profile/experience
// @desc    Add Experience to Profile
// @access  Private
router.put(
  '/experience',
  [
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From Date is required').not().isEmpty(),
    ],
    auth,
  ],
  async (req, res) => {
    // Check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExperience);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete Experience from Profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const exp = profile.experience;
    profile.experience = exp.filter((exp) => {
      return exp.id !== req.params.exp_id;
    });
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
