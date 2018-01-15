const mongoose = require('mongoose');

//Image Schema 
const SiteSchema =mongoose.Schema({
    domain: String,
    email_domains: [String],
    theme: String
}, {
    timestamps : true
});

const Site= module.exports = mongoose.model('Site',SiteSchema); 

