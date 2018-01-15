const mongoose = require('mongoose');

//Image Schema 
const SiteSchema =mongoose.Schema({
    domain: String,
    email_domains: [String],
    theme: String
}, {
    timestamps : true
});

const Image= module.exports = mongoose.model('Image',ImageSchema); 

