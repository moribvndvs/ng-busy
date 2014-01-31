ng-busy &nbsp;[![Build Status](https://travis-ci.org/HackedByChinese/ng-busy.png?branch=master)](https://travis-ci.org/HackedByChinese/ng-busy)
==============

An AngularJS module for reacting to when your app is busy. 

## About

You may wish for a simple way of letting your parts of your UI know the app is doing something. A simple example is a submit button that lets the user know their request is being processed, and for it to be disabled until the request is complete so they don't submit twice. This module can help. You can go [here](http://hackedbychinese.github.io/ng-busy) for a demo.


========

Copyright Mike Grabski @HackedByChinese

Licensed under [MIT](http://www.opensource.org/licenses/mit-license.php)

## Requirements
* Angular 1.2.0 or later

## What NgBusy Does
Check out the Overview in the wiki.

## Getting Started

Include `angular-busy.js` after `angular.js`. 

Bare bones example:

    angular.module('demo', ['ngBusy'])
        .controller('DemoCtrl', function($scope, $http) {
          $scope.submit = function() {
            // some arbitrary code that triggers an HTTP request
            $http.post('/path', {message: 'Hello world'});
          };
        });


In a partial:

    <div ng-controller="DemoCtrl">
      <button busy="Submitting.." ng-click="submit()">Submit</button>
    </div>

When "Submit" makes an `$http` request, the content of `button` will be replaced with a busy message. When the request completes, either by rejection or success, the content of the button will be restored.

## Roadmap

??

## Contributing

Contributors are welcome. I use the `git-flow` lifecyle, so `master` is the stable release and `development` is where latest ongoing development is happening.

## Developing

You will need Node/NPM, Grunt, and Bower. Once you checkout from git, run `npm install` then `bower install` to get dependencies.

### Testing

Use `grunt test` to run unit tests once, or `grunt test-server` to run them continuously.
