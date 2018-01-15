const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const BCRYPT_SALT_LEN = 9;

//User Schema
const UserSchema =mongoose.Schema({
    name : {
        first : String,
        last : String
    },
    email: {
        type : String,
        required: false, 
        index: true 
    },
    emailVerified : {
        type : Boolean,
        default : false
    }, 
    mobile: {
        type : String,
        required: false, 
        index: true 
    }, 
    mobileVerified : {
        type : Boolean,
        default : false
    }, 
    password: {
        type : String,
        required: false
    }, 
    role : {
        type : String,
        enum : ['user', 'programadmin', 'siteadmin', 'superadmin'],
        default : 'user'
    },
    picture_id: mongoose.Schema.Types.ObjectId,
    picture_name: String,
    thumbnail_name: String,
    company_id: mongoose.Schema.Types.ObjectId,
    company_name: String,
    designation: String,
    city: String,
    country: String,
    source: {
        type: String,
        enum: ['self', 'dummy', 'invited']
    } 
}, {
    timestamps : true
});
UserSchema.virtual('fullName').get(function () {
    let fullName='';
    if(this.name.first){
        fullName+= this.name.first;
    }
    if(this.name.last){
        fullName+= ' ' + this.name.last;
    }
  return fullName;
});
UserSchema.virtual('verified').get(function () {
  return this.mobileVerified || this.emailVerified;
});
const User= module.exports = mongoose.model('User',UserSchema); 

module.exports.getUserById = (id, callback) => {
    console.log("id is" + id);
    User.findById(id, callback);
}

module.exports.getUserByUsername = (username, callback) => {
    let query;
    if(username.indexOf('@')!=-1){
        query = {email: username};
    } else {
        query = {mobile: username};
    }
    User.findOne(query, callback);
}
module.exports.getUserByMobileOrEmail = (email, mobile, callback) => {
    let query;
    if(email && mobile){
        query = {$or: [{email: email},{mobile:mobile}]};
    } else if(mobile) {
        query = {mobile: mobile};
    } else {
        query = {email: email};
    }
    User.findOne(query, callback);
}

module.exports.addUser = (newUser, callback) => {
    bcrypt.genSalt(BCRYPT_SALT_LEN, (err, salt) => {
        if(err) throw err;
        bcrypt.hash(newUser.password, salt, (err, hash) =>{
            if(err) throw err;  
            newUser.password=hash;
            newUser.save(callback);
        });
    })
}

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) =>{
        if(err) throw err;
        callback(null, isMatch);
    });
}