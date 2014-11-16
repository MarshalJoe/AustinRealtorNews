var mongoose = require('mongoose');
var LocalStrategy   = require('passport-local').Strategy;
var User = mongoose.model('User');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

// login strategy
	passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            // check in mongo if a user with username exists or not
            User.findOne({ 'username' :  username }, 
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        var message = 'User Not Found with username '+ username;
                        console.log(message);
                        return done(null, false, message);                 
                    }
                    // User exists but wrong password, log the error 
                    if (!isValidPassword(user, password)){
                        var message = 'Invalid Password';
                        console.log(message);
                        return done(null, false, message); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                    return done(null, user);
                }
            );

        })
    );


    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    }
    
}