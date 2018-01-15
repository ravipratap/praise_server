module.exports.setConfig = function () {
    process.env.CLOUDINARY_URL ="cloudinary://355432271179754:WZbVVA4Nn9CoQ_c9BsxuyADry2w@ravipratap";
    process.env.SENDPULSE_ID="b4ba74fabb9aa9b635cd64d52bbb08a6";//khannarohit0@gmail.com
    process.env.SENDPULSE_SECRET="68fd6a5973d6558c34bb6f01f24696cb";
    process.env.GOOGLEPLACES_SECRET="AIzaSyAF9uDgvIvLmDw09Eow84sNzZXNjpFfRuU";
    if(process.env.PORT){
        process.env.MONGODB_CONNECTION ="mongodb://praise:praise@ds259245.mlab.com:59245/praise";//username:ravi.pratap
        process.env.JWT_SECRET = "mentorsecret";  
    } else {
        process.env.MONGODB_CONNECTION ="mongodb://localhost:27017/praise";
        process.env.JWT_SECRET = "mentorsecret";    
    };
}