const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    // Get token from req header
    const token = req.header('x-auth-token');

    // Check if no token
    if(!token){
        res.sendStatus(401);
        // return res.status(401).json({msg:'No token, authorization denied'});
    }

    // Verify Token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch (err) {
        res.sendStatus(401);
    }
}