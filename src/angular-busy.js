
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

    // minimal: <button busy="Loading..." />
    // complete: <button busy="Loading..." busy-when-url="string|/regex/" busy-when-name="string|/regex/" busy-add-classes="string" busy-remove-classes="string" busy-disabled="bool" not-busy-when-url="string|/regex/" not-busy-when-name="string|/regex/" not-busy-add-classes="string" not-busy-remove-classes="string" not-busy-disabled="bool" />
    
	angular.module('ngBusy.busy', [])
		.directive('busy', ['$parse', '$timeout', function($parse, $timeout) {
			return {
				restrict: 'A',
				scope: {},
				link: function(scope, element, attrs) {
					attrs.$observe('busy', function(val) {
						scope.busyText = angular.isString(val) && val.length > 0 ? val : 'Loading...';
					});

					attrs.$observe('busyWhenUrl', function(val) {
						scope.busyWhenUrl = val;
					});
					attrs.$observe('busyWhenName', function(val) {
						scope.busyWhenName = val;
					});
					attrs.$observe('busyAddClasses', function(val) {
						scope.busyAddClasses = val;
					});
					attrs.$observe('busyRemoveClasses', function(val) {
						scope.busyRemoveClasses = val;
					});
					attrs.$observe('busyDisabled', function(val) {
						var parsed = $parse(val)(scope);
						scope.busyDisabled = angular.isDefined(parsed) ? parsed : true;
					});

					attrs.$observe('notBusyWhenUrl', function(val) {
						scope.notBusyWhenUrl = val;
					});
					attrs.$observe('notBusyWhenName', function(val) {
						scope.notBusyWhenName = val;
					});
					attrs.$observe('notBusyAddClasses', function(val) {
						scope.notBusyAddClasses = val;
					});
					attrs.$observe('notBusyRemoveClasses', function(val) {
						scope.notBusyRemoveClasses = val;
					});
					attrs.$observe('notBusyDisabled', function(val) {
						var parsed = $parse(val)(scope);
						scope.notBusyDisabled = angular.isDefined(parsed) ? parsed : false;
					});

					scope.$on('busy.begin', function() {
						if (!scope.busy) {
							scope.notBusyContent = element.html();
							//$timeout(function() {element.attr('disabled', true)})
							if (scope.busyText) element.html(scope.busyText);

							scope.busy = true;
						}
					});

					scope.$on('busy.end-one', function(args) {
						if (scope.busy) {							
							if (scope.busyText) element.html(scope.notBusyContent);

							scope.busy = false;
						}
					})
				}
			}
		}]);

	angular.module('ngBusy', ['ngBusy.interceptor', 'ngBusy.busy']);
})(window, window.angular);