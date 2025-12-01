const router = require('express').Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');
const config = require ('config');

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post('/', [
    // Configure validation rules for a request body
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({min:6}),
], async (req,res) =>  {
    // Pass the request to the validationResult() method to check payload against requirements
    const errors = validationResult(req);

    // If there are errors, return 400 and send the errors back
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array() })
    };
    
    // Destructure values from the req body
    const {name, email, password} = req.body;

    try {
        // Make sure user isn't arleady registered
        let user = await User.findOne({email});
        
        // If already registered, throw a 400 and return error
        if(user){
            return res.status(400).json({ errors : [ { msg : 'User already exists'} ] })
        }

        // Request avatar if exists, default if not
        const avatar = gravatar.url(email, {
            s: "200",
            r: "pg",
            default: "mm",
        });

        // Create new user from User model
        user = new User({
            name,
            email,
            avatar,
            password:null,
        });

        // Create encryption salt
        const salt = await bcrypt.genSalt(10);

        // Encrypt the password for security
        user.password = await bcrypt.hash(password, salt);

        // Save the user to the DB
        await user.save();

        const jwtPayload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            jwtPayload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if(err) throw err
                res.json({ token });
            },
        );

    }catch(err){
        // If there's an error, log it
        console.error(err.message);

        // Set the status to 500 and send an error message back
        res.sendStatus(500);
    }

});

module.exports = router;