const mongoose = require('mongoose');

const UserBriefSchema =mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    name: String,
    thumbnail: String
}); 

const PlaceBriefSchema =mongoose.Schema({
    place_id: mongoose.Schema.Types.ObjectId,
    name: String,
    categories: [String],
    picture_url: String ,
    loc: {
        type: {type: String},
        coordinates: [Number]
    }
}); 
const CommentSchema =mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    name: String,
    like_category: {
        type : String,
        enum : ['like', 'hatsoff', 'smiley', 'props'],
    },
    comment: String,
    picture_id: mongoose.Schema.Types.ObjectId,
    picture_name: String
}); 



//Praise Schema 
const PraiseSchema =mongoose.Schema({
    from: UserBriefSchema,
    to: UserBriefSchema,
    where: PlaceBriefSchema,
    note: String,
    picture_id: mongoose.Schema.Types.ObjectId,
    picture_name: String, 
    comments: [CommentSchema]
}, {
    timestamps : true
});
PraiseSchema.index({'from.user_id': 1});
PraiseSchema.index({'where.place_id': 1}, {sparse: true});

const Praise= module.exports = mongoose.model('Praise',PraiseSchema); 

