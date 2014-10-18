var app = angular.module('realtorNews', []);

app.factory('postFactory', function() {
	var factory = {}
	factory.posts = [
		{title: 'post 1', link:"https://www.facebook.com", upvotes: 5},
		{title: 'post 2', link:"https://www.twitter.com", upvotes: 2}
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