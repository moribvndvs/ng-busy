(function(window, angular, undefined) {
	'use strict';
	angular.module('demo', ['ngBusy', 'ui.bootstrap'])
		.controller('DemoCtrl', function($scope, $http) {
			$scope.posts = [];
		    $scope.section = null;
		    $scope.subreddit = null;
		    $scope.subreddits = ['cats', 'pics', 'funny', 'gaming', 'AdviceAnimals', 'aww']; // tempted to put spacedicks in there

            // reddit snippet http://chieffancypants.github.io/angular-loading-bar/
		    var getRandomSubreddit = function() {
		      var sub = $scope.subreddits[Math.floor(Math.random() * $scope.subreddits.length)];

		      // ensure we get a new subreddit each time.
		      if (sub == $scope.subreddit) {
		        return getRandomSubreddit();
		      }

		      return sub;
		    };

		    $scope.fetch = function() {
		      $scope.subreddit = getRandomSubreddit();
		      
		      $http.jsonp('http://www.reddit.com/r/' + $scope.subreddit + '.json?limit=100&jsonp=JSON_CALLBACK', {name: 'reddit'}).success(function(data) {
		        // we're requesting 100 entries just to exaggerate the loading bar's progress
		        // since this is just for an example, don't display all 100, just the first 5
		        var posts = data.data.children.slice(0,5);
		        $scope.posts = posts;
		      });
		    };
		});
	
})(window, window.angular);