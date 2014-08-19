'use strict';

function ProjectController($scope, $window, $http, AuthenticationService, $rootScope) {
    $scope.isAuthenticated = AuthenticationService.get();
    
    $scope.$on('change.isAuthenticated', function (event, value) {
        $scope.isAuthenticated = value;
    })

    $scope.projectUse = '';
    $scope.projectList = [];

    $scope.useProject = function(projectName) {
        $scope.projectUse = projectName;
        $rootScope.$broadcast('change.projectname', projectName);
    };

    $scope.newProject = function(projectName) {
        if ($window.sessionStorage.username === undefined) {
            var username = 'Anonyme';
        } else {
            var username = $window.sessionStorage.username;
        }

        var data = {
            'name': projectName,
            'username': username
        };

        $scope.projectUse = projectName;
        $scope.projectList.push(data);
        $scope.useProject(projectName);
        $http.post('/add-project', data).success(function(data, status, headers, config) {

        });
    };

    $scope.projectListFn = function() {
        if ($scope.isAuthenticated === true) {
            if ($window.sessionStorage.username === undefined) {
                var username = 'Anonyme';
            } else {
                var username = $window.sessionStorage.username;
            }

            $http({method: 'GET', url: '/projectList?username=' + username }).
                success(function(data, status, headers, config) {
                    var projectList = data.data;
                    projectList.forEach(function(project) {
                        $scope.projectList.push(project);
                    });
                }).
                error(function(data, status, headers, config) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
                });
        } else {
            $scope.projectList = [];
        }
    };


    $scope.$watch('isAuthenticated', function() {
        $scope.projectListFn();
    });
    
}