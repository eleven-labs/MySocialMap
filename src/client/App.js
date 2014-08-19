'use strict';

var app = angular.module('socialMapApp',['services', 'google-maps', 'ngRoute', 'angularFileUpload', 'ngAutocomplete', 'btford.socket-io']);

var appServices = angular.module('services', []);

var options = {};
options.api = {};
options.api.base_url = "";

app.factory('socket', function (socketFactory) {
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
            when('/register', {
                templateUrl: 'partials/register.html',
                controller: UserController
            }).
            when('/login', {
                templateUrl: 'partials/signin.html',
                controller: UserController
            }).
            when('/logout', {
                templateUrl: 'partials/logout.html',
                controller: UserController,
                access: { requiredAuthentication: true }
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication 
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {

            $location.path("/login");
        }
    });
});
