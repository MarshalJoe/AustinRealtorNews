var app = angular.module('realtorNews', [
	'ui.router',
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'http-auth-interceptor',
]);


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
			.state('login', {
				url: '/login',
				templateUrl: '/login.html',
				controller: 'MainCtrl'
			})
			.state('signup', {
				url: '/signup',
				templateUrl: '/signup.html',
				controller: 'MainCtrl'
			})
			.state('profile', {
				url: '/profile',
				templateUrl: '/profile.html',
				controller: 'MainCtrl'
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


// Post factory using Mongo
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
		return $http.delete('/delete/post/' + post._id);
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
	factory.deleteComment = function (comment) {
		return $http.delete('delete/comment/' + comment._id);
	};
	factory.upvoteComment = function (post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
			.success(function (data) {
				comment.upvotes += 1;
			});
	};
	factory.createUser = function (user) {
		console.log("createUser function in postFactory called");
		return $http.post('/signup', user);
	};
	factory.login = function (user) {
		console.log("login postFactory called");
		return $http.post('/login', user);
	}
	return factory;
}]);


// User factory
app.factory('User', function ($resource) {
    return $resource('/auth/users/:id/', {},
      {
        'update': {
          method:'PUT'
        }
      });
});

// Session factory
app.factory('Session', function ($resource) {
    return $resource('/auth/session/');
});

// Authentication factory
app.factory('Auth', function Auth($location, $rootScope, Session, User, $cookieStore) {
    $rootScope.currentUser = $cookieStore.get('user') || null;
    $cookieStore.remove('user');

    return {

      login: function(provider, user, callback) {
      	console.log("login auth factory function called");
        var cb = callback || angular.noop;
        Session.save({
          provider: provider,
          email: user.email,
          password: user.password,
          rememberMe: user.rememberMe
        }, function(user) {
          $rootScope.currentUser = user;
          return cb();
        }, function(err) {
          return cb(err.data);
        });
      },

      logout: function(callback) {
        var cb = callback || angular.noop;
        Session.delete(function(res) {
            $rootScope.currentUser = null;
            return cb();
          },
          function(err) {
            return cb(err.data);
          });
      },

      currentUser: function() {
        Session.get(function(user) {
          $rootScope.currentUser = user;
        });
      },

      changePassword: function(email, oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;
        User.update({
          email: email,
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
            console.log('password changed');
            return cb();
        }, function(err) {
            return cb(err.data);
        });
      },

      removeUser: function(email, password, callback) {
        var cb = callback || angular.noop;
        User.delete({
          email: email,
          password: password
        }, function(user) {
            console.log(user + 'removed');
            return cb();
        }, function(err) {
            return cb(err.data);
        });
      }
    };
  });

// Main Controller
app.controller('MainCtrl', [
'$scope',
'$rootScope',
'postFactory',
'Auth',
'$location',
function ($scope, $rootScope, postFactory, Auth, $location) {
	$scope.posts = postFactory.posts;
	$scope.user = {};
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
	$scope.user = window.user;
	$scope.register = function() {
      console.log('register function called');
      postFactory.createUser($scope.credential).success(function (response) {
				console.log(response, response.error);
				if (response.error) {
					$scope.error = true;
					return $scope.errorMessage = response.message;
				}

				$rootScope.user = response.user;
				$scope.credential = null;
				$location.path('/');
			}).error(function (err) {
				console.log(err);
			});
    };
  $scope.logout = function() {
    Auth.logout(function(err) {
      if(!err) {
        $location.path('/login');
      }
    });
  };
  $scope.login = function() {
    console.log("login function called");
    postFactory.login($scope.credential).success(function(response) {
     		
        if (response.error) {
        	return $scope.error = response.message;
        } 

        $rootScope.user = response.user;
        $location.path('/');
    }).error(function (err) {
    	console.log(err);
    });
  };
	$scope.incrementUpvotes = function (post) {
		postFactory.upvote(post);
	};
}]);


// Posts Controller
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
	$scope.deleteComment = function (comment) {
		postFactory.deleteComment(comment);
		window.location.reload();
	};
	$scope.incrementUpvotes = function (comment) {
		postFactory.upvoteComment(post, comment);
	};
}]);


  app.run(function ($rootScope, $location, Auth) {

    //watching the value of the currentUser variable.
    $rootScope.$watch('currentUser', function(currentUser) {
      // if no currentUser and on a page that requires authorization then try to update it
      // will trigger 401s if user does not have a valid session
      if (!currentUser && (['/', '/login', '/logout', '/signup'].indexOf($location.path()) == -1 )) {
        Auth.currentUser();
      }
    });

    // On catching 401 errors, redirect to the login page.
    // $rootScope.$on('event:auth-loginRequired', function() {
    //   $location.path('/login');
    //   return false;
    // });
  });
