
(function (window, angular, undefined) {
    'use strict';

    angular.module('ngBusy.interceptor', [])
        .provider('busyInterceptor', function() {

            this.$get = ['$rootScope', '$q', function($rootScope, $q) {
                var _total = 0, _completed = 0;

                function complete() {
                    _total = _completed = 0;
                }

                function handleResponse(r) {
                    if (r.config.notBusy) return;

                    $rootScope.$broadcast('busy.end', {url: r.config.url, name: r.config.name, remaining: _total - ++_completed});
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
            }];
        })
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('busyInterceptor');
        }]);

    // minimal: <button busy="Loading..." />
    // complete: <button busy="Loading..." busy-when-url="string" busy-when-name="string" busy-add-classes="string" busy-remove-classes="string" busy-disabled="bool" not-busy-when-url="string" not-busy-when-name="string" not-busy-add-classes="string" not-busy-remove-classes="string" not-busy-disabled="bool" />

    angular.module('ngBusy.busy', [])
        .directive('busy', ['$parse', '$timeout', function($parse, $timeout) {
            return {
                restrict: 'A',
                transclude: false,
                scope: {},
                controller: ['$scope', function($scope) {
                    this.setBusyMessageElement = function(element) {
                        $scope.busyMessageElement = element;
                    },
                        this.setOriginalMessageElement = function(element) {
                            $scope.originalMessageElement = element;
                        }
                }],
                link: function(scope, element, attrs) {
                    attrs.$observe('busy', function(val) {
                        scope.busyMessage = val;
                    });
                    attrs.$observe('original', function(val) {
                        scope.originalMessage = val;
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

                    scope.isBusyFor = function(config, begin) {
                        var key;
                        if (scope[(key = begin ? 'busyWhenName' : 'notBusyWhenName')]) return !!config.name && !!config.name.match(scope[key]);
                        else if (scope[(key = begin ? 'busyWhenUrl' : 'notBusyWhenUrl')]) return !!config.url && !!config.url.match(scope[key]);
                        else return begin === true || config.remaining <= 0;
                    };

                    scope.$on('busy.begin', function(evt, config) {
                        if (!scope.busy && scope.isBusyFor(config, true)) {
                            //scope.originalContent = element.html();

                            if (scope.busyDisabled) $timeout(function() {element.attr('disabled', true);});

                            var msgElement = scope.busyMessageElement;// ? scope.busyMessageElement.clone() : null;
                            if (msgElement || scope.busyMessage) element.html('').append(msgElement || scope.busyMessage);

                            element.removeClass(scope.busyRemoveClasses).addClass(scope.busyAddClasses);

                            scope.busy = true;
                        }
                    });

                    scope.$on('busy.end', function(evt, config) {
                        if (scope.busy && scope.isBusyFor(config)) {
                            //if (scope.originalContent) element.html(scope.originalContent);

                            element.attr('disabled', scope.notBusyDisabled===true);

                            console.log(scope.originalMessageElement);

                            var msgElement = scope.originalMessageElement;// ? scope.originalMessageElement.clone() : null;
                            if (msgElement || scope.originalMessage) element.html('').append(msgElement || scope.originalMessage);

                            element.removeClass(scope.notBusyRemoveClasses).addClass(scope.notBusyAddClasses);

                            scope.busy = false;
                        }
                    });
                }
            }
        }])
        .directive('originalMessage', function() {
            return {
                restrict: 'AE',
                transclude: true,
                require: '^busy',
                template: '',
                replace: true,
                compile: function(element, attr, transclude) {
                    // we're basically going to transclude the content, strip it, and set the busy message as the resulting transcluded HTML via the controller setBusyMessageElement function
                    return function link(scope, element, attr, busyCtrl) {
                        busyCtrl.setOriginalMessageElement(transclude(scope, function() {}));
                    }
                }
            }
        })
        .directive('busyMessage', function() {
            return {
                restrict: 'AE',
                transclude: true,
                require: '^busy',
                template: '',
                replace: true,
                compile: function(element, attr, transclude) {
                    // we're basically going to transclude the content, strip it, and set the busy message as the resulting transcluded HTML via the controller setBusyMessageElement function
                    return function link(scope, element, attr, busyCtrl) {
                        busyCtrl.setBusyMessageElement(transclude(scope, function() {}));
                    }
                }
            }
        });

    angular.module('ngBusy', ['ngBusy.interceptor', 'ngBusy.busy']);
})(window, window.angular);
