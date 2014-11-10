var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

// passport stuff
var passport = require('passport');

var flash = require('connect-flash');

// config files
var env = process.env.NODE_ENV || 'development',
  config = require('./config/config')[env]; 

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var methodOverride = require('method-override');
// set up Mongo
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(expressSession);

mongoose.connect('mongodb://localhost/news');
require("./models/Posts");
require("./models/Comments");
require("./models/User");

var app = express();

app.use(cookieParser());

// required for passport
app.use(expressSession({
  secret: 'MEAN',
  saveUninitialized: true,
  resave: true,
  store: new mongoStore({
    url: config.db,
    collection: 'sessions'
  })
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var initPassport = require('./passport/init');
initPassport(passport);

// ruotes should be last
require('./routes/index')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
