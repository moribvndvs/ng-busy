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

    	it ('should decrement and broadcast busy.end-one event when a request is completed, and then broadcast busy.end-all when there are no outstanding.', function() {
    		expect(interceptor.outstanding()).toBe(0);

    		$httpBackend.expectGET('path').respond({});
    		$httpBackend.expectGET('path').respond({});

    		$http.get('path', {name: 'test1'});
    		$http.get('path', {name: 'test2'});
    		$httpBackend.flush();

    		// make sure the events were broadcast and we end with 0 outstanding requests
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end-one', {url: 'path', name: 'test1', remaining: 1});
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end-one', {url: 'path', name: 'test2', remaining: 0});
    		expect(interceptor.outstanding()).toBe(0);

    		// make sure the final event was broadcast
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end-all');

    	});

    	it ('should decrement and broadcast busy.end-one event when a request is reject, and then broadcast busy.end-all when there are no outstanding.', function() {
    		expect(interceptor.outstanding()).toBe(0);

    		$httpBackend.expectGET('path').respond(400);
    		$httpBackend.expectGET('path').respond(400);

    		$http.get('path', {name: 'test1'});
    		$http.get('path', {name: 'test2'});
    		$httpBackend.flush();

    		// make sure the events were broadcast and we end with 0 outstanding requests
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end-one', {url: 'path', name: 'test1', remaining: 1});
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end-one', {url: 'path', name: 'test2', remaining: 0});
    		expect(interceptor.outstanding()).toBe(0);

    		// make sure the final event was broadcast
    		expect($rootScope.$broadcast).toHaveBeenCalledWith('busy.end-all');

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
});