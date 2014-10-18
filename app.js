var app = angular.module('realtorNews', ['ui.router']);


app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl'
			});

		$urlRouterProvider.otherwise('home');
	}]);

app.factory('postFactory', function() {
	var factory = {}
	factory.posts = [
		{title: 'Facebook is neat', link:"https://www.facebook.com", upvotes: 5},
		{title: 'Twitter is cool too', link:"https://www.twitter.com", upvotes: 2},
		{title: 'More smashing stuff!', link:"https://www.facebook.com", upvotes: 5},
		{title: "Look here's another link", link:"https://www.twitter.com", upvotes: 2}
	]
	return factory;
});


app.controller('MainCtrl', [
'$scope',
'postFactory',
function ($scope, postFactory) {
	$scope.posts = postFactory.posts;
	$scope.addPost = function () {
		if($scope.title === '') {return;}
		$scope.posts.push({
			title: $scope.title,
			link: $scope.link, 
			upvotes: 0});
		$scope.title = '';
		$scope.link = '';
	};
	$scope.incrementUpvotes = function (post) {
		post.upvotes += 1;
	};
}]);