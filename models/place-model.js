const mongoose = require('mongoose');

//Place Schema 
const PlaceSchema =mongoose.Schema({
    name: {
        type : String,
        required: true, 
        index: true 
    },
    loc: {
        type: {type: String},
        coordinates: [Number]
    },
    city: String,
    country: String,
    street: String,
    zip: String,
    fb_id: String,
    fb_is_verified: Boolean, 
    fb_checkins: Number,  
    fb_rating: Number,  
    categories: [String],
    picture_id: mongoose.Schema.Types.ObjectId,
    picture_path: String,
    source: {
        type: String,
        enum: ['facebook', 'app']
    }
}, {
    timestamps : true
});
PlaceSchema.index({'fb_id': 1}, {sparse:true});
PlaceSchema.index({loc: '2dsphere'});

// define a method to find the closest places
PlaceSchema.methods.findClosest = function(cb) {
    return this.model('Place').find({
        loc: {$nearSphere: this.loc},
        name: {$ne: this.name}
    }).limit(1).exec(cb);
};

const Place= module.exports = mongoose.model('Place',PlaceSchema); 

