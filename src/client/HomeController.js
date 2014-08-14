'use strict';

function HomeController($scope, $http, FileUploader, socket, $window, $filter) {
    var uploader = $scope.uploader = new FileUploader({
        url: 'file-upload'
    });
    $scope.filteredMarkers = [];

    $scope.searchMap = function() {
        $scope.map = {
            center: {
                latitude: $scope.details.geometry.location.lat(),
                longitude: $scope.details.geometry.location.lng()
            },
            zoom: 15,
        };

        $scope.marker = {
            id: 1,
            coords: {
                latitude: $scope.details.geometry.location.lat(),
                longitude: $scope.details.geometry.location.lng()
            },
            show: true
        };

        $scope.lat = $scope.details.geometry.location.lat();
        $scope.lon = $scope.details.geometry.location.lng();
    };

    $scope.options1 = null;
    $scope.details = '';
    $scope.modd

    $scope.markers = [];
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        var id = $scope.filteredMarkers.length + 1;
        
        if ($window.sessionStorage.username === undefined) {
            var username = 'Anonyme';
        } else {
            var username = $window.sessionStorage.username;
        }

        var data = {
            'latitude': $scope.lat,
            'longitude': $scope.lon,
            'icon': '/images/resize/' + response,
            'real': '/images/' + response,
            'username': username
        };

        socket.emit('upload', { id: id, lat: $scope.lat, lon: $scope.lon, icon: '/images/resize/' + response, username: username, real: '/images/' + response});

        $http.post('/save-point', data).success(function(data, status, headers, config) {
          // this callback will be called asynchronously
          // when the response is available
        });
        uploader.clearQueue();
    };
    
    console.info('uploader', uploader);
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            $scope.map = {
                center: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                zoom: 12
            };

            $scope.lat = position.coords.latitude;
            $scope.lon = position.coords.longitude;

            $scope.marker = {
                id: 1,
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                },
                show: true
            };
        });
    } else {
        $scope.error = 'Impossible';
    }

    $scope.map = {
        center: {
            latitude: 45,
            longitude: -73
        },
        zoom: 8,
    };

    $scope.marker = {
        id: 1,
        coords: {
            latitude: 49,
            longitude: 2.56
        },
        show: true
    };

    var markerToClose = null;

    $scope.onMarkerClicked = function (marker) {
        markerToClose = marker;
        marker.showWindow = true;
        $scope.$apply();
    };

    $scope.clusterEvents = {
        click: function (cluster, clusterModels) {
            window.alert("Cluster Models: clusterModels: " + JSON.stringify(clusterModels));
        }
    };

    
    $scope.usersList = function() {
        $http({method: 'GET', url: '/usersList'}).
            success(function(data, status, headers, config) {
                var points = data.data;
                var i = 1;
                var markers = [];
                points.forEach(function(img) {
                    markers.push(
                        {
                            id: i,
                            latitude: img.latitude,
                            longitude: img.longitude,
                            icon: img.icon,
                            real: img.real,
                            showWindow: false,
                            username: img.username
                        }
                    );
                    i++;
                });

                $scope.updateMarkers(markers);
            }).
            error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
            });
    };

    $scope.updateMarkers = function(markers) {
        _.each(markers, function (marker) {
            marker.closeClick = function () {
                marker.showWindow = false;
                $scope.$apply();
            };
            marker.onClick = function () {
                $scope.onMarkerClicked(marker);
            };
        });

        $scope.filteredMarkers = markers;
    };

    socket.on('update-markers', function (data) {
        $scope.usersList();
    });

    $scope.$watch("searchUsername", function(searchUsername){
        $scope.filteredMarkers = $filter("filter")($scope.filteredMarkers, {username: searchUsername});
        if (!$scope.filteredMarkers){
            return;
        }
    });

    $scope.events =  {
        click: function (mapModel, eventName, originalEventArgs) {
            // 'this' is the directive's scope
            var e = originalEventArgs[0];
            var lat = e.latLng.lat(),
                lon = e.latLng.lng();
            $scope.lat = lat;
            $scope.lon = lon;

            $scope.marker = {
                id: 1,
                coords: {
                    latitude: lat,
                    longitude: lon
                },
            };
              //scope apply required because this event handler is outside of the angular domain
            $scope.$apply();
        }
    };

    $scope.usersList();
}
