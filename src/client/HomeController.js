function HomeController($scope, $http, FileUploader, socket, $window, $filter) {
    $scope.filteredMarkers = [];
    $scope.foursquareMarkers = [];
    $scope.markers = [];
    $scope.projectUseName = 'public';
    $scope.options1 = null;
    $scope.details = '';
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
    var markerToCloseFoursquare = null;

    // Init map with geolocalisation
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

    var uploader = $scope.uploader = new FileUploader({
        url: 'file-upload'
    });

    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        var id = $scope.filteredMarkers.length + 1;
        var username = '';
        if ($window.sessionStorage.username === undefined) {
            username = 'Anonyme';
        } else {
            username = $window.sessionStorage.username;
        }

        var data = {
            'latitude': $scope.lat,
            'longitude': $scope.lon,
            'icon': '/images/resize/' + response,
            'real': '/images/' + response,
            'username': username,
            'projectname': $scope.projectUseName
        };

        socket.emit('upload', { id: id, lat: $scope.lat, lon: $scope.lon, icon: '/images/resize/' + response, username: username, real: '/images/' + response});

        $http.post('/save-point', data).success(function(data, status, headers, config) {});

        uploader.clearQueue();
    };

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

    $scope.foursquareSelected = {show: false};
    $scope.windowFoursquare = {};
    $scope.windowFoursquare.show = false;
    $scope.windowFoursquare.title = '';

    $scope.clusterEventsFoursquare = {
        click: function (cluster, clusterModels) {
            _.each(clusterModels, function (clusterModel) {
                $scope.windowFoursquare.coords = {
                    latitude: clusterModel.latitude,
                    longitude: clusterModel.longitude
                };

                $scope.windowFoursquare.title = clusterModel.title;
            });

            $scope.windowFoursquare.show = true;
        }
    };

    var points = [];
    $scope.$on('add.foursquareMarkers', function (event, value) {
        var id = points.length;
        var point = {
            id: id,
            latitude: value.lat,
            longitude: value.lng,
            title: value.name,
            showWindow: false
        };

        point.onClickFoursquare = function() {
            $scope.foursquareSelected.show = true;
            $scope.foursquareSelected = point;
        };

        points.push(point);
        $scope.foursquareMarkers = points;
    });


    $scope.$on('change.projectname', function (event, value) {
        $scope.projectUseName = value;
        $scope.usersList(value);
    });

    $scope.usersList = function(projectname) {
        $http({method: 'GET', url: '/usersList', params: { projectname: projectname}}).
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

        $scope.markers = markers;

        if (markers.length === 0) {
            $scope.filteredMarkers = [];
        } else {
            $scope.filteredMarkers = markers;
        }
    };

    socket.on('update-markers', function (data) {
        $scope.usersList($scope.projectUseName);
    });

    $scope.$watch("searchUsername", function(searchUsername) {
        $scope.filteredMarkers = $filter("filter")($scope.markers, {username: searchUsername});
        if (!$scope.filteredMarkers) {
            return;
        }
    });

    $scope.events = {
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
