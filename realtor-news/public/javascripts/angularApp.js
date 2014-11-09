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
				controller: 'SignupCtrl'
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
	factory.signup = function () {
		return $http.post('/signup').success(function (data) {
			console.log("successully called factory function");
		})
	};
	return factory;
}]);

// Authentication factory
app.factory('Auth', function Auth($location, $rootScope, Session, User, $cookieStore) {
    $rootScope.currentUser = $cookieStore.get('user') || null;
    $cookieStore.remove('user');

    return {

      login: function(provider, user, callback) {
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

      createUser: function(userinfo, callback) {
        var cb = callback || angular.noop;
        User.save(userinfo,
          function(user) {
            $rootScope.currentUser = user;
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

// Main Controller
app.controller('MainCtrl', [
'$scope',
'postFactory',
'Auth',
function ($scope, postFactory, Auth) {
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
  $scope.login = function(form) {
    Auth.login('password', {
        'email': $scope.user.email,
        'password': $scope.user.password
      },
      function(err) {
        $scope.errors = {};

        if (!err) {
          $location.path('/');
        } else {
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.type;
          });
          $scope.error.other = err.message;
        }
    });
  };
	$scope.incrementUpvotes = function (post) {
		postFactory.upvote(post);
	};
}]);

// Navbar Controller
app.controller('NavbarCtrl', [
	'$scope',
	'Auth',
	'$location',
	function ($scope, Auth, $location) {
    $scope.menu = [{
      "title": "Blogs",
      "link": "blogs"
    }];

    $scope.authMenu = [{
      "title": "Create New Blog",
      "link": "blogs/create"
    }];

    $scope.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };
  }]);

// Signup Controller
app.controller('SignupCtrl', [
	'$scope',
	'Auth',
	'$location',
	function ($scope, Auth, $location) {
    $scope.register = function(form) {
      Auth.createUser({
          email: $scope.user.email,
          username: $scope.user.username,
          password: $scope.user.password
        },
        function(err) {
          $scope.errors = {};

          if (!err) {
            $location.path('/');
          } else {
            angular.forEach(err.errors, function(error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.type;
            });
          }
        }
      );
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

// Directives
app.directive('mongooseError', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        element.on('keydown', function() {
          return ngModel.$setValidity('mongoose', true);
        });
      }
    };
  });

app.constant('focusConfig', {
    focusClass: 'focused'
  })

  .directive('onFocus', function (focusConfig) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$focused = false;
        element
          .bind('focus', function(evt) {
            element.addClass(focusConfig.focusClass);
            scope.$apply(function() {ngModel.$focused = true;});
          })
          .bind('blur', function(evt) {
            element.removeClass(focusConfig.focusClass);
            scope.$apply(function() {ngModel.$focused = false;});
          });
      }
    }
  });

  app.directive('uniqueUsername', function ($http) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        function validate(value) {
          if(!value) {
            ngModel.$setValidity('unique', true);
            return;
          }
          $http.get('/auth/check_username/' + value).success(function(user) {
            if(!user.exists) {
              ngModel.$setValidity('unique', true);
            } else {
              ngModel.$setValidity('unique', false);
            }
          });
        }

        scope.$watch( function() {
          return ngModel.$viewValue;
        }, validate);
      }
    };
  });
