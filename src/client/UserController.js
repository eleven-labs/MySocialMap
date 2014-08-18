'use strict';

function UserController($scope, $location, $window, UserService, AuthenticationService) {

    $scope.isAuthenticated = AuthenticationService.isAuthenticated;
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
                AuthenticationService.isAuthenticated = true;
                $window.sessionStorage.username = username;
                $window.sessionStorage.token = data.token;
                $scope.username = username;
                $scope.isAuthenticated = AuthenticationService.isAuthenticated;
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }

    $scope.logOut = function logOut() {
        if (AuthenticationService.isAuthenticated) {
            
            UserService.logOut().success(function(data) {
                AuthenticationService.isAuthenticated = false;
                delete $window.sessionStorage.token;
                delete $window.sessionStorage.username;
                $scope.username = 'Anonyme';
                $scope.isAuthenticated = AuthenticationService.isAuthenticated;
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }

    $scope.register = function register(username, password, passwordConfirmation) {
        if (AuthenticationService.isAuthenticated) {
            $location.path("/");
        }
        else {
            UserService.register(username, password, passwordConfirmation).success(function(data) {
                $location.path("/login");
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }
}