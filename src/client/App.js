'use strict';

angular.module('socialMapApp',['google-maps', 'ngRoute', 'angularFileUpload', 'ngAutocomplete', 'btford.socket-io'])
    .factory('socket', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect()
        })
    })
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/index.html',
                controller: HomeController
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }]);