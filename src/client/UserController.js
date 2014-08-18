'use strict';

function UserController($scope, $location, $window, UserService, AuthenticationService, $rootScope) {

    $scope.isAuthenticated = AuthenticationService.get();
    $scope.displayregister = false;
    if ($window.sessionStorage.username === undefined) {
        $scope.username = 'Anonyme';
    } else {
        $scope.username = $window.sessionStorage.username;
    }

    $scope.displayRegister = function displayRegister() {
        $scope.displayregister = !$scope.displayregister;
    }

    //Admin User Controller (signIn, logOut)
    $scope.signIn = function signIn(username, password) {
        if (username != null && password != null) {

            UserService.signIn(username, password).success(function(data) {
                AuthenticationService.set(true);
                $rootScope.$broadcast('change.isAuthenticated', AuthenticationService.get());
                $scope.isAuthenticated = AuthenticationService.get();
                $window.sessionStorage.username = username;
                $window.sessionStorage.token = data.token;
                $scope.username = username;
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }

    $scope.logOut = function logOut() {
        if (AuthenticationService.get()) {
            
            UserService.logOut().success(function(data) {
                AuthenticationService.set(false);
                $rootScope.$broadcast('change.isAuthenticated', AuthenticationService.get());
                $scope.isAuthenticated = AuthenticationService.get();
                delete $window.sessionStorage.token;
                delete $window.sessionStorage.username;
                $scope.username = 'Anonyme';
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }

    $scope.register = function register(username, password, passwordConfirm) {
        if (AuthenticationService.get()) {
            $location.path("/");
        }
        else {
            UserService.register(username, password, passwordConfirm).success(function(data) {
                $location.path("/login");
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }
}