var app = angular.module('realtorNews', ['ui.router']);


app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				resolve: {
					postPromise: ['postFactory', function (postFactory) {
						return postFactory.getAll();
					}]
				}
			})
			.state('new', {
				url: '/new',
				templateUrl: '/new.html',
				controller: 'MainCtrl'
			})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl',
			resolve: {
        post: ['$stateParams', 'postFactory', function ($stateParams, postFactory) {
          return postFactory.get($stateParams.id);
        }]
      }
		});

		$urlRouterProvider.otherwise('home');
	}]);


// Factory service for Mongo
app.factory('postFactory', ['$http', function ($http) {
	var factory = {}
	factory.posts = [];
	factory.get = function(id) {
		return $http.get('/posts/' + id).then(function (res) {
			return res.data;
		});
	};
	factory.getAll = function() {
		return $http.get('/posts').success(function (data) {
			angular.copy(data, factory.posts);
		});
	};
	factory.create = function (post) {
		return $http.post('/posts', post).success(function (data) {
			factory.posts.push(data);
		})
	};
	factory.deletePost = function (post) {
		return $http.get('/delete/' + post._id);
	}
	factory.upvote = function (post) {
		return $http.put('/posts/' + post._id + '/upvote')
			.success(function (data) {
				post.upvotes += 1;
			});
	};
	factory.addComment = function (id, comment) {
		return $http.post('/posts/' + id + '/comments', comment)
	};
	factory.upvoteComment = function (post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
			.success(function (data) {
				comment.upvotes += 1;
			});
	};
	return factory;
}]);


app.controller('MainCtrl', [
'$scope',
'postFactory',
function ($scope, postFactory) {
	$scope.posts = postFactory.posts;
	$scope.addPost = function () {
		if($scope.title === '') {return;}
		postFactory.create({
			title: $scope.title,
			link: $scope.link, 
			upvotes: 0,
		});
		$scope.title = '';
		$scope.link = '';
		window.location.href="#/home";
	};
	$scope.incrementUpvotes = function (post) {
		postFactory.upvote(post);
	};
}]);

app.controller('PostsCtrl', [
'$scope',
'postFactory',
'post',
function ($scope, postFactory, post) {
	$scope.post = post;	
	$scope.addComment = function () {
		if ($scope.body === '') {return; }
		postFactory.addComment(post._id, {
			body: $scope.body,
			author: 'user',
		}).success(function (comment) {
			$scope.post.comments.push(comment);
		});
		$scope.body = '';
	};
	$scope.deletePost = function (post) {
		postFactory.deletePost(post);
		window.location.href="#/home";
		window.location.reload();
	};
	$scope.incrementUpvotes = function (comment) {
		postFactory.upvoteComment(post, comment);
	};
}]);
