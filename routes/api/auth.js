const router = require('express').Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const config = require ('config');

// @route   GET api/auth
// @desc    Auth route
// @access  Public
router.get('/', auth, async (req,res) =>  {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.log(err.message);
        res.sendStatus(500);
    }
});


// @route   POST api/auth
// @desc    Authenticate User
// @access  Public
router.post('/', [
    // Configure validation rules for a request body
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
], async (req,res) =>  {
    // Pass the request to the validationResult() method to check payload against requirements
    const errors = validationResult(req);

    // If there are errors, return 400 and send the errors back
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array() })
    };
    
    // Destructure values from the req body
    const {email, password} = req.body;

    try {
        // Make sure user isn't arleady registered
        let user = await User.findOne({email});
        
        // If user doesn't exist, throw a 400 and return a vague credential error
        if(!user){
            return res.status(400).json({ errors : [ { msg : 'Credentials are invalid'} ] })
        }
        
        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);            
        if(!isMatch){
            return res.status(400).json({ errors : [ { msg : 'Credentials are invalid'} ] })
        };

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