const express =  require('express');
const path =  require('path');
const bodyParser =  require('body-parser');
const cors =  require('cors');
const passport =  require('passport');
const mongoose =  require('mongoose');
const multer  =  require('multer');
// var https = require('https');
// var fs = require('fs');

// var options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };


//Set Configs
const configs = require('./config/configs');
configs.setConfig();


const app= express();
const PORT= process.env.PORT || 3000;

//Connect Database
mongoose.Promise = global.Promise; //https://stackoverflow.com/questions/38138445/node3341-deprecationwarning-mongoose-mpromise
mongoose.connect(process.env.MONGODB_CONNECTION, {useMongoClient: true});
//On Connection
mongoose.connection.on('connected', () => {
    console.log('connected to database '+ process.env.MONGODB_CONNECTION);
});
//On Error
mongoose.connection.on('error', (err) => {
    console.log('Database error:  '+ err);
});

//Middlewares
//allow cors
app.use(cors());
// parse application/json 
app.use(bodyParser.json());
//set static folders
app.use(express.static(path.join(__dirname,'public')));

//Authentication
app.use(passport.initialize());
// app.use(passport.session());
require('./config/passport')(passport);

//Routes
const userRoutes = require('./routes/user-routes');
app.use('/users', userRoutes);
app.get('/', (req, res) => {
    res.send("<h1>get the best professional growth with mentor rank!!!</h1>");
});

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

// module.exports = {
//     upload_multer: upload,
//     UPLOAD_PATH: UPLOAD_PATH
// }

app.listen(PORT, () => {
    console.log('Server started on port '+ PORT);
});
// https.createServer(options, app).listen(PORT, () => {
//         console.log('Server started on port '+ PORT);
//     });
