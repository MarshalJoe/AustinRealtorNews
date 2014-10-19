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
			});

		$stateProvider
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl'
		});

		$urlRouterProvider.otherwise('home');
	}]);


// Factory service for Mongo
app.factory('postFactory', ['$http', function ($http) {
	var factory = {}
	factory.posts = [];
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
	};
	$scope.incrementUpvotes = function (post) {
		post.upvotes += 1;
	};
}]);

app.controller('PostsCtrl', [
'$scope',
'$stateParams',
'postFactory',
function ($scope, $stateParams, postFactory) {
	$scope.post = postFactory.posts[$stateParams.id];	
	$scope.addComment = function () {
		if ($scope.body === '') {return; }
		$scope.post.comments.push({
			body: $scope.body,
			author: 'user',
			upvotes: 0
		})
		$scope.body = '';
	};
}]);
