var express = require('express');
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var auth = require('../config/auth');

module.exports = function(app, passport){

	// GET Home page
	app.get('/', function (req, res) {
		res.render('index', {title: 'Express'})
	});

	// Login 
	app.get("/login", function (req, res){ 
		res.render("/login.html");
	});

	// Login form authentication
	app.post("/login" 
		,passport.authenticate('local',{
			successRedirect : "/#/profile",
			failureRedirect : "/#/signup",
		})
	);

	// Signup
	app.get("/signup", function (req, res) {
		res.render("signup");
	});

	//POST-powered sign up
	app.post("/signup", auth.ensureAuthenticated, function (req, res, next) {
		User.signup(req.body.email, req.body.password, function(err, user){
			if(err) throw err;
			req.login(user, function(err){
				if(err) return next(err);
				return res.redirect("/");
			});
		});
	});

	//Profile
	app.get("/profile", auth.ensureAuthenticated , function(req, res){ 
		res.render("profile", { user : req.user});
	});

	// Logout
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/login');
	});

	// GET posts index page
	app.get('/posts', function (req, res, next) {
	  Post.find(function (err, posts) {
	  	if (err) {return next(err); }
	  
	  	res.json(posts);
	  });
	});

	// POST new post
	app.post('/posts', function (req, res, next) {
		var post = new Post(req.body);

		post.save(function (err, post) {
			if(err) {return next(err); }

			res.json(post);
		});
	});

	// Return a post
	app.get('/posts/:post', function (req, res, next) {
		req.post.populate('comments', function (err, post) {
			res.json(post);
		});
	});

	// Upvote a post
	app.put('/posts/:post/upvote', function (req, res, next) {
		req.post.upvote(function (err, post) {
			if(err) {return next(err); }

			res.json(post);
		});
	});

	// DELETE a post
	app.delete('/delete/post/:post', function (req, res) {
			Post.findByIdAndRemove(req.params.post, function(err, doc){
	      res.status(200).send(doc); 
	    });
	});


	// Preload post objects on routes with ':post'
	app.param('post', function (req, res, next, id) {
		var query = Post.findById(id);

		query.exec(function (err, post) {
			if (err) {return next(err); }
			if(!post) {return next(new Error("can't find post")); }
		
			req.post = post;
			return next();
		});
	});

	// Preload comment objects on routes with ':comment'
	app.param('comment', function (req, res, next, id) {
		var query = Comment.findById(id);

		query.exec(function (err, comment) {
			if (err) {return next(err); }
			if (!comment) {return next(new Error("can't find comment")); }

			req.comment = comment;
			return next();
		});
	});



	// Create a new comment
	app.post('/posts/:post/comments', function (req, res, next) {
	  var comment = new Comment(req.body);
	  comment.post = req.post;

	  comment.save(function(err, comment){
	    if(err){ return next(err); }

	    req.post.comments.push(comment);
	    req.post.save(function(err, post) {
	      if(err){ return next(err); }

	      res.json(comment);
	    });
	  });
	});

	// Delete a comment
	app.delete('/delete/comment/:comment', function (req, res) {
			Comment.findByIdAndRemove(req.params.comment, function(err, doc){
	      res.status(200).send(doc); 
	    });

	});


	// Upvote a comment
	app.put('/posts/:post/comments/:comment/upvote', function (req, res, next) {
	  req.comment.upvote(function(err, comment){
	    if (err) { return next(err); }

	    res.json(comment);
	  });
	});




	//end of exports
}



















