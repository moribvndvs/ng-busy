
(function (window, angular, undefined) {
	'use strict';

	angular.module('ngBusy.interceptor', [])
		.provider('busyInterceptor', function() {

			this.$get = function($rootScope, $q) {
				var _total = 0, _completed = 0;

	            function complete() {
	            	_total = _completed = 0;
	            	$rootScope.$broadcast('busy.end-all');
	            }

	            function handleResponse(r) {
	            	if (r.config.notBusy) return;

	            	$rootScope.$broadcast('busy.end-one', {url: r.config.url, name: r.config.name, remaining: _total - ++_completed});
	            	if (_completed >= _total) complete();
	            }

				return {
					outstanding: function() {
						return _total - _completed;
					},
					'request': function(config) {
						if (!config.notBusy) {
							$rootScope.$broadcast('busy.begin', {url: config.url, name: config.name});
							_total++;
						}
						return config || $q.when(config);
					},
					'response': function(response) {
						handleResponse(response);
						return response;
					},
					'responseError': function(rejection) {
						handleResponse(rejection);
						return $q.reject(rejection);
					}
				};
			};

			this.$get.$inject = ['$rootScope', '$q'];			
		})
		.config(['$httpProvider', function($httpProvider) {			
			$httpProvider.interceptors.push('busyInterceptor');
		}]);
})(window, window.angular);