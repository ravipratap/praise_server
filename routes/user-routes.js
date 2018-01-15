const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const gm = require('gm')

// require('../config   /passport')(passport);
const jwt = require('jsonwebtoken');

const User = require('../models/user-model');
const Place = require('../models/place-model');
const Praise = require('../models/praise-model');
const Image = require('../models/image-model');

const Authenticate = require('./authenticate');

// const Upload= require('../app');
const multer  =  require('multer');
const UPLOAD_PATH = 'uploads';
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage })

router.post('/signup', (req, res, next) => {
    let newUser = new User({
        name: {
            first: req.body.firstName,
            last: req.body.lastName
        },
        email: req.body.email,
        password: req.body.password
    });
    // User.addUser(newUser, (err, user) => {
    //     if(err){
    //         res.json({success: false, msg:'Failed to register user'});
    //     } else {
    //         res.json({success: true, msg:'User registered'});
    //     }
    // });
    // start
    if(!newUser.email && !newUser.mobile){
        return res.status(422).send({error: 'You must enter an email address or mobile'});
    }
 
    if(!newUser.password){
        return res.status(422).send({error: 'You must enter a password'});
    }
 
    User.getUserByMobileOrEmail(newUser.email, newUser.mobile, function(err, existingUser){
 
        if(err){
            return next(err);
        }
 
        if(existingUser){
            return res.status(422).send({error: 'That email address or mobile is already in use'});
        }
 
        User.addUser(newUser, (err, user) => {
            if(err){
                res.status(422).send({success: false, msg:'Failed to register user'});
            } else {
                let tokenData=Authenticate.getJWTtoken(user);
                return res.json({
                    success: true,
                    token: 'JWT '+ tokenData.token,
                    user: tokenData.userForToken
                });
                res.json({success: true, msg:'User registered'});
            }
        });
 
    });
    // end
});

router.post('/authenticate', (req, res, next) => {
    const username=req.body.username;
    const password=req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.json({success: false, msg: 'User not found'});
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                console.log("User matched:  " + user);
                // let userForToken = {
                //         _id: user._id,
                //         name: user.name,
                //         role: user.role
                //     };
                // let token= jwt.sign(userForToken, config.secret, {
                //     expiresIn: 604800 // 1 week
                // });
                let tokenData=Authenticate.getJWTtoken(user);
                return res.json({
                    success: true,
                    token: 'JWT '+ tokenData.token,
                    user: tokenData.userForToken
                });
            } else {
                return res.json({success: false, msg: 'password mismatch'});
            }
        });
    });
});

router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    console.log("inside profile route");
    console.log(req.user);
    User.getUserById(req.user._id,(err, userFromDb) => {
        if(err) throw err;
        if(!userFromDb){
            return res.json({success: false, msg: 'User not found'});
        }
        console.log(userFromDb);
        let userForDisplay={
            name:userFromDb.fullName,
            email:userFromDb.email,
            verified: userFromDb.verified,
            role: userFromDb.role,
            mobile: userFromDb.mobile,
            emailVerified: userFromDb.emailVerified,
            mobileVerified: userFromDb.mobileVerified,
            pictureName: userFromDb.picture_name,
            thumbnailName:userFromDb.thumbnail_name
        }
        res.json({user : userForDisplay});
    });
    
});  

router.get('/admin', 
    passport.authenticate('jwt', {session: false}), 
    Authenticate.roleAuthorization(['admin']),
    (req, res, next) => {
    res.json({user : req.user});
});


router.get('/transact', 
    passport.authenticate('jwt', {session: false}), 
    Authenticate.recentlyLoggedIn(),
    (req, res, next) => {
    res.json({user : req.user});
});





router.get('/praises', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    
    Praise.find({}).sort({updatedAt: -1}).limit(5).exec((err, praiseList) => {
        if (err) {
            return res.sendStatus(400);
        }
        console.log(praiseList);
        res.json({praiseList : praiseList});
    });
    
});   
// Upload a new image with description
router.post('/profilePicture', passport.authenticate('jwt', {session: false}), upload.single('picture'), (req, res, next) => {
    console.log('req.picture.filename: '+ req.file.filename);
    let newImage= new Image({
        filename: req.file.filename,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        path: req.file.destination+'/'+req.file.filename,
        size: req.file.size
    });
    console.log(newImage);
    let thumbnailName='thumbnail-' + Date.now();
    let thumbnailPath=path.join(UPLOAD_PATH, thumbnailName);
    gm(newImage.path)
    .resize(40, 40)
    .noProfile()
    .write(thumbnailPath, function (err) {   
        if (err) {
            return res.sendStatus(400);
        }
        newImage.thumbnail_name=thumbnailName;
        newImage.thumbnail_name_path=thumbnailPath;
        newImage.save(err => {
            if (err) {
                return res.sendStatus(400);
            }
            // res.status(201).send({ newImage });
        });
        console.log(req.user);
        User.getUserById(req.user._id,(err, userFromDb) => {
            if(err || !userFromDb) {
                return res.sendStatus(400);
            }
            console.log(userFromDb);
            userFromDb.picture_id=newImage._id;
            userFromDb.picture_name=newImage.filename;
            userFromDb.thumbnail_name=newImage.thumbnail_name;
            userFromDb.save(err => {
                if (err) {
                    return res.sendStatus(400);
                }                
                res.json({success : true});
            });
        });
    });   
});

// Upload a new image with description
router.post('/images', passport.authenticate('jwt', {session: false}), upload.single('picture'), (req, res, next) => {
    console.log('req.picture.filename: '+ req.file.filename);
    console.log(req.body);
    
    let newImage= new Image({
        filename: req.file.filename,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        path: req.file.destination+'/'+req.file.filename,
        size: req.file.size
    });
    console.log(newImage);
    newImage.save(err => {
        if (err) {
            return res.sendStatus(400);
        }
        // res.status(201).send({ newImage });
    });
    let newUser= new User({
        name: {
            first: req.body.person
        },
        source: 'dummy'
    })
    console.log(newUser);
    newUser.save(err => {
        if (err) {
            return res.sendStatus(400);
        }
    });
    let newPlace= new Place({
        name: req.body.venue_name,
        loc: {
            type: 'Point',
            coordinates: [req.body.venue_longitude, req.body.venue_latitude]
        },
        city: req.body.venue_city,
        country: req.body.venue_country,
        street: req.body.venue_street,
        zip: req.body.venue_zip,
        fb_id: req.body.venue_id,
        fb_is_verified: req.body.venue_is_verified, 
        fb_checkins: req.body.venue_checkins, 
        picture_path: req.body.venue_picture,
        source: 'facebook'
    });
    if(req.body.venue_overall_star_rating){
        newPlace.fb_rating= req.body.venue_overall_star_rating;
    }
    // if(req.body.venue.category_list){
    //     let categories=[]
    //     for(category in req.body.venue.category_list){
    //         categories.push(category.name)
    //     }
    //     newPlace.categories=categories;
    // }
    console.log(newPlace);
    newPlace.save(err => {
        if (err) {
            console.log(err);
            return res.sendStatus(400);
        }
    });
    console.log(req.user);
    User.getUserById(req.user._id,(err, userFromDb) => {
        if(err || !userFromDb) {
            return res.sendStatus(400);
        }
        let newPraise=new Praise({
            from: {
                user_id: userFromDb._id,
                name: userFromDb.fullName,
                thumbnail: userFromDb.thumbnail_name
            },
            to: {
                user_id: newUser._id,
                name: newUser.fullName
            },
            where: {
                place_id: newPlace._id,
                name: newPlace.name,
                categories: newPlace.categories,
                loc: {
                    type: 'Point',
                    coordinates: newPlace.loc.coordinates
                },
                picture_url:newPlace.picture_path
            },
            note: req.body.note,
            picture_name: newImage.filename,
            picture_id: newImage._id
        });
        console.log(newPraise);
        newPraise.save(err => {
            if (err) {
                return res.sendStatus(400);
            }
        });

        res.json({success : true});
    }); 
  
});
 
// Get all uploaded images
router.get('/images', (req, res, next) => {
    // use lean() to get a plain JS object
    // remove the version key from the response
    // Image.find({}, '-__v').lean().exec((err, images) => {
    //     if (err) {
    //         res.sendStatus(400);
    //     }
 
    //     // Manually set the correct URL to each image
    //     for (let i = 0; i < images.length; i++) {
    //         var img = images[i];
    //         img.url = req.protocol + '://' + req.get('host') + '/images/' + img._id;
    //     }
    //     res.json(images);
    // })
});
 
// Get one image by its ID
router.get('/images/:id', (req, res, next) => {
    var imgName = req.params.id;
 
    // Image.findById(imgId, (err, image) => {
    //     if (err) {
    //         res.sendStatus(400);
    //     }
    //     // stream the image back by loading the file
    //     res.setHeader('Content-Type', 'image/jpeg');
    //     console.log('image.filename '+image.filename);
    //     fs.createReadStream(path.join(UPLOAD_PATH, image.filename)).pipe(res); 
    // })

    console.log('image.filename '+imgName);
    res.setHeader('Content-Type', 'image/jpeg');
    fs.createReadStream(path.join(UPLOAD_PATH, imgName)).pipe(res);
});
 
// Delete one image by its ID
router.delete('/images/:id', (req, res, next) => {
    var imgId = req.params.id;
    del([path.join(UPLOAD_PATH, imgId)]).then(deleted => {
        res.sendStatus(200);
    })
 
    // Image.findByIdAndRemove(imgId, (err, image) => {
    //     if (err && image) {
    //         res.sendStatus(400);
    //     }
 
    //     del([path.join(Upload.UPLOAD_PATH, image.filename)]).then(deleted => {
    //         res.sendStatus(200);
    //     })
    // })
});

module.exports=router;