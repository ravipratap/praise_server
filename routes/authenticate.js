const User = require('../models/user-model');
const jwt = require('jsonwebtoken');

module.exports.roleAuthorization = function(roles){

    return function(req, res, next){

        var user = req.user;
        
         //getting user data from token and not from DB
        if(roles.indexOf(user.role) > -1){
                return next();
            }

        res.status(401).json({error: 'You are not authorized to view this content'});
        return next('Unauthorized');

        /*User.getUserById(user._id, function(err, foundUser){

            if(err){
                res.status(422).json({error: 'No user found.'});
                return next(err);
            }
            console.log('foundUser '+ foundUser);
            if(roles.indexOf(foundUser.role) > -1){
                return next();
            }

            res.status(401).json({error: 'You are not authorized to view this content'});
            return next('Unauthorized');

        });*/

    }

}
module.exports.recentlyLoggedIn = function(roles){

    return function(req, res, next){

        var user = req.user;
        // logged in less than hour ago
        if(user.issued > 3600){
            res.status(401).json({error: 'You are not authorized to view this content'});
            return next('Unauthorized');
        } else  {
            return next();
        }

    }

}

module.exports.getJWTtoken = function(user){
    let userForToken = {
            _id: user._id,
            name: user.fullName,
            verified: user.verified,
            role: user.role
        };
    let token= jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: 604800 // 1 week
    });
    return { 
        token:          token,
        userForToken:   userForToken
    };
}