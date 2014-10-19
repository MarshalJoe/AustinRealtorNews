var express = require('express');
var router = express.Router();


//GET Home page
router.get('/', function (req, res) {
	res.render('index', {title: 'Express'})
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// GET posts index page
router.get('/posts', function (req, res, next) {
  Post.find(function (err, posts) {
  	if (err) {return next(err); }
  
  	res.json(posts);
  });
});

// POST new post
router.post('/posts', function (req, res, next) {
	var post = new Post(req.body);

	post.save(function (err, post) {
		if(err) {return next(err); }

		res.json(post);
	});
});

// Preload post objects on routes with ':post'
router.param('post', function (req, res, next, id) {
	var query = Post.findById(id);

	query.exec(function (err, post) {
		if (err) {return next(err); }
		if(!post) {return next(new Error("can't find post")); }
	
		req.post = post;
		return next();
	});
});

// Preload comment objects on routes with ':comment'
router.param('comment', function (req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function (err, comment) {
		if (err) {return next(err); }
		if (!comment) {return next(new Error("can't find comment")); }

		req.comment = comment;
		return next();
	});
});

// Return a post
router.get('/posts/:post', function (req, res, next) {
	req.post.populate('comments', function (err, post) {
		res.json(post);
	});
});

// Upvote a post
router.put('/posts/:post/upvote', function (req, res, next) {
	req.post.upvote(function (err, post) {
		if(err) {return next(err); }

		res.json(post);
	});
});



module.exports = router;
