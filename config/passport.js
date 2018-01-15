const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User= require('../models/user-model');

module.exports = (passport) => {
    let opts= {}
    // opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.jwtFromRequest =ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = process.env.JWT_SECRET;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        console.log(jwt_payload);
        let issuedAt = new Date(jwt_payload.iat*1000);
        let timeFromIssue= (Date.now()/1000-jwt_payload.iat);
        console.log('token was issued at '+ issuedAt + ' and time from issue is '+ timeFromIssue) ;
        
        let user = {
            _id: jwt_payload._id,
            name: jwt_payload.name,
            verified: jwt_payload.verified,
            role: jwt_payload.role,
            issued: timeFromIssue
        };
        //getting user data from token and not from DB
        if (user) {
            done(null, user);
        } else {
            done(null, false);
            // or you could create a new account 
        }
        /*User.getUserById(jwt_payload.id, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
                // or you could create a new account 
            }
        });*/
    }));
}

