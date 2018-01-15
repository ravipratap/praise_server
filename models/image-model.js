const mongoose = require('mongoose');

//Image Schema 
const ImageSchema =mongoose.Schema({
    filename: String,
    original_name: String,
    mime_type: String,
    path: String,
    size: String,
    thumbnail_name: String, 
    thumbnail_name_path: String
}, {
    timestamps : true
});

const Image= module.exports = mongoose.model('Image',ImageSchema); 

