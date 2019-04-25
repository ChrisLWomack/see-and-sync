// server.js

// set up ======================================================================
// get all the tools we need
//modules
var express  = require('express');
var app      = express();
//equal to something i set as environment variable or 8080
var port     = process.env.PORT || 8080;
const MongoClient = require('mongodb').MongoClient
//a way of interacting with mongo db
var mongoose = require('mongoose');
//module for authentication, does everything for us, create users handle logged in session
var passport = require('passport');
//how we'll get error messages, wrong password, or no user found
var flash    = require('connect-flash');
//package that lets us debug, shows play by play all requests that are happening in the terminal
//logger logs all http request
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
//helps us managed the loginned in user section
var session      = require('express-session');
//grabs this file and stores whats exported in config database.js
//stores that object, url to database and db name are in object
//allows you to put this file in a git ignore so my database name and password isn't public
var configDB = require('./config/database.js');

var db

// configuration ===============================================================
//connect to database with mongoose
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db);
}); // connect to our database

//app.listen(port, () => {
    // MongoClient.connect(configDB.url, { useNewUrlParser: true }, (error, client) => {
    //     if(error) {
    //         throw error;
    //     }
    //     db = client.db(configDB.dbName);
    //     console.log("Connected to `" + configDB.dbName + "`!");
    //     require('./app/routes.js')(app, passport, db);
    // });
//});

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))//we dont have to write individual endppoints

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2019a', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
//52 to 69 every project

// routes ======================================================================
//require('./app/routes.js')(app, passport, db); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
