'use strict';

describe('ngBusy', function() {

    beforeEach(function () {
        this.addMatchers({
            toEqualData: function (expected) {
                return angular.equals(this.actual, expected);
            }
        });
    });

    describe('interceptor', function() {
    	beforeEach(module('ngBusy.interceptor'));

    	var $httpBackend, $http, $rootScope, interceptor;

    	beforeEach(function() {
    		inject(function(_$httpBackend_, _$http_, _$rootScope_, _busyInterceptor_) {
    			$rootScope = _$rootScope_;
    			$http = _$http_;
    			$httpBackend = _$httpBackend_;
    			interceptor = _busyInterceptor_;
    		});

    		spyOn($rootScope, '$broadcast');
    	});

    	afterEach(function() {
    		$httpBackend.verifyNoOutstandingExpectation();
        	$httpBackend.verifyNoOutstandingRequest();
    	});

    	it ('should increment and broadcast busy.begin event when a request is created.', function() {
    		expect(interceptor.outstanding()).toBe(0);

    		$httpBackend.expectGET('path').respond(function() {
    			expect(interceptor.outstanding()).toBe(1);
    			expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.begin', {url: 'path', name: 'test'});
    			return {};
    		});

    		$http.get('path', {name: 'test'});

    		$httpBackend.flush();
    	});

    	it ('should decrement and broadcast busy.end event when a request is completed, and then broadcast busy.end-all when there are no outstanding.', function() {
    		expect(interceptor.outstanding()).toBe(0);

    		$httpBackend.expectGET('path').respond({});
    		$httpBackend.expectGET('path').respond({});

    		$http.get('path', {name: 'test1'});
    		$http.get('path', {name: 'test2'});
    		$httpBackend.flush();

    		// make sure the events were broadcast and we end with 0 outstanding requests
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end', {url: 'path', name: 'test1', remaining: 1});
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end', {url: 'path', name: 'test2', remaining: 0});
    		expect(interceptor.outstanding()).toBe(0);
    	});

    	it ('should decrement and broadcast busy.end event when a request is reject, and then broadcast busy.end-all when there are no outstanding.', function() {
    		expect(interceptor.outstanding()).toBe(0);

    		$httpBackend.expectGET('path').respond(400);
    		$httpBackend.expectGET('path').respond(400);

    		$http.get('path', {name: 'test1'});
    		$http.get('path', {name: 'test2'});
    		$httpBackend.flush();

    		// make sure the events were broadcast and we end with 0 outstanding requests
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end', {url: 'path', name: 'test1', remaining: 1});
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end', {url: 'path', name: 'test2', remaining: 0});
    		expect(interceptor.outstanding()).toBe(0);
    	});

    	it ('should ignore requests if notBusy is true', function() {
    		expect(interceptor.outstanding()).toBe(0);

			$httpBackend.expectGET('path').respond(function() {
    			expect(interceptor.outstanding()).toBe(0);
    			expect($rootScope.$broadcast).not.toHaveBeenCalled();
    			return {};
    		});

    		$http.get('path', {notBusy:true});

    		$httpBackend.flush();
    	});

    	it ('should ignore responses if notBusy is true', function() {
			expect(interceptor.outstanding()).toBe(0);

			$httpBackend.expectGET('path').respond(200);
    		$http.get('path', {notBusy:true});

    		$httpBackend.flush();

    		expect(interceptor.outstanding()).toBe(0);
    		expect($rootScope.$broadcast).not.toHaveBeenCalled();
    	});

    	it ('should ignore rejections if notBusy is true', function() {
			expect(interceptor.outstanding()).toBe(0);

			$httpBackend.expectGET('path').respond(400);
    		$http.get('path', {notBusy:true});

    		$httpBackend.flush();

    		expect(interceptor.outstanding()).toBe(0);
    		expect($rootScope.$broadcast).not.toHaveBeenCalled();
    	});
    });

	describe('busy', function() {
		beforeEach(module('ngBusy.busy'));

    	var $rootScope, $scope, $compile, $document, $timeout, create;

    	beforeEach(inject(function(_$rootScope_, _$compile_, _$document_, _$timeout_) {
    		$rootScope = _$rootScope_;
            $compile = _$compile_;
            $document = _$document_;
            $timeout = _$timeout_;

            create = function(template) {
            	template = template || '<button busy="Loading..."><i class="icon-ok"></i> Submit</button>';
            	var el = $compile(angular.element(template))($rootScope);
            	$rootScope.$digest();
            	return el;
            };
    	}));

        it ('should use default options', function() {
            $scope = create('<button busy></button>').isolateScope();
            expect($scope.busyMessage).toBe('');
            expect($scope.busyWhenUrl).toBeUndefined();
            expect($scope.busyWhenName).toBeUndefined();
            expect($scope.busyAddClasses).toBeUndefined();
            expect($scope.busyRemoveClasses).toBeUndefined();
            expect($scope.busyDisabled).toBeTruthy();
            expect($scope.notBusyWhenUrl).toBeUndefined();
            expect($scope.notBusyWhenName).toBeUndefined();
            expect($scope.notBusyAddClasses).toBeUndefined();
            expect($scope.notBusyRemoveClasses).toBeUndefined();
            expect($scope.notBusyDisabled).toBeFalsy();
        });

        it ('should use explicit options', function() {
            $scope = create('<button busy="Busy..." busy-when-url="url" busy-when-name="name" busy-add-classes="add classes" busy-remove-classes="remove classes" busy-disabled="false" not-busy-when-url="url" not-busy-when-name="name" not-busy-add-classes="add classes" not-busy-remove-classes="remove classes" not-busy-disabled="true"></button>').isolateScope();
            expect($scope.busyMessage).toBe('Busy...');
            expect($scope.busyWhenUrl).toBe('url');
            expect($scope.busyWhenName).toBe('name');
            expect($scope.busyAddClasses).toBe('add classes');
            expect($scope.busyRemoveClasses).toBe('remove classes');
            expect($scope.busyDisabled).toBe(false);
            expect($scope.notBusyWhenUrl).toBe('url');
            expect($scope.notBusyWhenName).toBe('name');
            expect($scope.notBusyAddClasses).toBe('add classes');
            expect($scope.notBusyRemoveClasses).toBe('remove classes');
            expect($scope.notBusyDisabled).toBe(true);
        });

        it('should swap original content with busy message on any busy.begin', function() {
            var el = create(), $scope = el.isolateScope();

            expect($scope.busy).toBeFalsy();

            $rootScope.$broadcast('busy.begin', {url: '/path', name: 'name'});

            expect($scope.originalContent).toBe('<i class="icon-ok"></i> Submit');
            expect(el.html()).toBe("Loading...");
            expect($scope.busy).toBe(true);
        });

        it ('should swap busy message with original content on busy.end with zero remaining', function() {
            var el = create(), $scope = el.isolateScope();

            $rootScope.$broadcast('busy.begin', {url: '/path', name: 'name'});
            expect($scope.busy).toBe(true);

            $rootScope.$broadcast('busy.end', {url: '/path', name: 'name', remaining: 0});
            expect($scope.busy).toBe(false);
            expect(el.html()).toBe('<i class="icon-ok"></i> Submit');
        });

        it ('should disable buttons when busy then restore', function() {
            var el = create(), $scope = el.isolateScope();

            $rootScope.$broadcast('busy.begin', {url: '/path', name: 'name'});
            $timeout.flush();
            expect($scope.busy).toBe(true);
            expect(el.attr('disabled')).toBe('disabled');

            $rootScope.$broadcast('busy.end', {url: '/path', name: 'name', remaining: 0});
            expect(el.attr('disabled')).toBeUndefined();
        });

        it ('should not disabled buttons', function() {
            var el = create('<button busy busy-disabled="false"></button>'), $scope = el.isolateScope();

            $rootScope.$broadcast('busy.begin', {url: '/path', name: 'name'});
            $timeout.flush();
            expect($scope.busy).toBe(true);
            expect(el.attr('disabled')).toBeUndefined();

            $rootScope.$broadcast('busy.end', {url: '/path', name: 'name', remaining: 0});
            expect(el.attr('disabled')).toBeUndefined();
        });

        it ('should not renable buttons', function() {
            var el = create('<button busy busy-disabled="false" not-busy-disabled="true"></button>'), $scope = el.isolateScope();

            $rootScope.$broadcast('busy.begin', {url: '/path', name: 'name'});
            $timeout.flush();
            expect($scope.busy).toBe(true);
            expect(el.attr('disabled')).toBeUndefined();

            $rootScope.$broadcast('busy.end', {url: '/path', name: 'name', remaining: 0});
            expect(el.attr('disabled')).toBe('disabled');
        });

        it ('isBusyFor should always return true when begin flag is true', function() {
            var el = create(), $scope = el.isolateScope();

            expect($scope.isBusyFor({remaining: 0}, true)).toBe(true);
            expect($scope.isBusyFor({name: 'name', url: 'path', remaining: 2}, true)).toBe(true);
        });

        it ('isBusyFor should return true only if remaining is zero', function() {
            var el = create(), $scope = el.isolateScope();

            expect($scope.isBusyFor({remaining: 0})).toBe(true);
            expect($scope.isBusyFor({name: 'name', url: 'path', remaining: 2})).toBe(false);
        });

        it ('isBusyFor should return true only if url matches', function() {
            var el = create('<button busy busy-when-url="/path" not-busy-when-url="/returnpath"></button>'), $scope = el.isolateScope();

            // should match begin path
            expect($scope.isBusyFor({url: '/path'}, true)).toBe(true);
            expect($scope.isBusyFor({url: '/path'})).toBe(false);
            // should match end path
            expect($scope.isBusyFor({url: '/returnpath'})).toBe(true);
            expect($scope.isBusyFor({url: '/returnpath'}, true)).toBe(false);

            // should not match anything else
            expect($scope.isBusyFor({url: '', name:'name', remaining:0})).toBe(false);
        });

        it ('isBusyFor should return true only if name matches', function() {
            var el = create('<button busy busy-when-name="name" not-busy-when-name="returnname"></button>'), $scope = el.isolateScope();

            // should match begin name
            expect($scope.isBusyFor({name: 'name'}, true)).toBe(true);
            expect($scope.isBusyFor({name: 'name'})).toBe(false);
            // should match end name
            expect($scope.isBusyFor({name: 'returnname'})).toBe(true);
            expect($scope.isBusyFor({name: 'returnname'}, true)).toBe(false);

            // should not match anything else
            expect($scope.isBusyFor({url: '/path', remaining:0})).toBe(false);
        });

        it ('should add and remove classes when busy', function() {
            var el = create('<button busy busy-add-classes="addme addme2" busy-remove-classes="removeme removeme2" class="keepme removeme removeme2"></button>');

            $rootScope.$broadcast('busy.begin');

            expect(el.attr('class')).toBe('keepme ng-scope ng-isolate-scope addme addme2');
        });

        it ('should add and remove classes when not busy', function() {
            var el = create('<button busy not-busy-add-classes="addme addme2" not-busy-remove-classes="removeme removeme2" class="keepme removeme removeme2"></button>');

            $rootScope.$broadcast('busy.begin');

            expect(el.attr('class')).toBe('keepme removeme removeme2 ng-scope ng-isolate-scope');

            $rootScope.$broadcast('busy.end', {remaining:0});

            expect(el.attr('class')).toBe('keepme ng-scope ng-isolate-scope addme addme2');
        });

        it ('should transclude child busy-message directive when present and use as busyMessage', function() {
            var testValue = 'I\'m busy', expectedNotBusyMessage = '<busy-message></busy-message><em>Submit</em>';

            $rootScope.testValue = testValue;

            var el = create('<button busy><busy-message><strong>{{testValue}}</strong></busy-message><em>Submit</em></button>'), $scope = el.isolateScope();

            expect(el.html()).toBe(expectedNotBusyMessage);
            expect($scope.busyMessageElement[0].outerHTML).toMatch('<strong class="[a-z\\-\\s]+">I\'m busy</strong>');

            $rootScope.$broadcast('busy.begin');

            expect(el.html()).toMatch('<strong class="[a-z\\-\\s]+">I\'m busy</strong>');

            $rootScope.$broadcast('busy.end', {remaining: 0});

            expect(el.html()).toBe(expectedNotBusyMessage);
        });
	});
});
