'use strict';

function HomeController($scope, $http, FileUploader, socket) {
    var uploader = $scope.uploader = new FileUploader({
        url: 'file-upload'
    });
    
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
        var id = $scope.markers.length
        $scope.markers.push(
            {
              id: id,
              latitude: $scope.lat,
              longitude: $scope.lon,
              showWindow: true,
              icon: '/images/' + response
            }
        );

        var data = {
            'latitude': $scope.lat,
            'longitude': $scope.lon,
            'icon': '/images/' + response
        };

        socket.emit('upload', { id: id, lat: $scope.lat, lon: $scope.lon, icon: '/images/' + response});

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
         /*   
            $scope.infoWindow = {
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                },
                options: {
                    disableAutoPan: true
                },
                show: true
            };*/
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

    $http({method: 'GET', url: '/usersList'}).
        success(function(data, status, headers, config) {
            var points = data.data;
            points.forEach(function(img) {
                $scope.markers.push(
                    {
                        id: $scope.markers.length,
                        latitude: img.latitude,
                        longitude: img.longitude,
                        icon: img.icon
                    }
                );
            });
        }).
        error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
        });

    socket.on('update-markers', function (data) {
        $scope.markers.push(
        {
            id: data.id,
            latitude: data.lat,
            longitude: data.lon,
            icon: data.icon
        });
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
}
