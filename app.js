var app = angular.module('realtorNews', []);

app.controller('MainCtrl', [
'$scope',
function ($scope) {
	$scope.posts = [
		{title: 'post 1', link:"https://www.facebook.com", upvotes: 5},
		{title: 'post 2', link:"https://www.twitter.com", upvotes: 2},
	];
	$scope.addPost = function () {
		if($scope.title === '') {return;}
		$scope.posts.push({
			title: $scope.title,
			link: $scope.link, 
			upvotes: 0});
		$scope.title = '';
	};
	$scope.incrementUpvotes = function (post) {
		post.upvotes += 1;
	};
}]);