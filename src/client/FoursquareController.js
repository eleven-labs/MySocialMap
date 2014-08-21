function FoursquareController($scope, $http, $rootScope) {
    $scope.foursquare_username = '';

    $http({method: 'GET', url: '/foursquare' }).
        success(function(data, status, headers, config) {
            var user = data.data;
            if (user !== undefined) {
                $scope.foursquare_username = user.user.firstName;
            }
        }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });

    var nb_checkins = 1;
    var offset = 0;
    $scope.allcheck = true;
    $scope.advanced = 'Checkins';

    $scope.getCheckins = function()
    {
        $scope.advanced = '0 %';
        var percent = parseInt((offset * 100) / nb_checkins, 10);
        $scope.advanced = percent.toString() + ' %';

        $http({method: 'GET', url: '/checkins?limit=200&offset=' + offset }).
            success(function(data, status, headers, config) {
                var checkins_items = data.data.checkins.items;
                nb_checkins = data.data.checkins.count;

                checkins_items.forEach(function(checkins_item) {
                    var lat = checkins_item.venue.location.lat;
                    var lng = checkins_item.venue.location.lng;
                    var name = checkins_item.venue.name;

                    $rootScope.$broadcast('add.foursquareMarkers', {lat: lat, lng: lng, name: name});
                });

                offset = offset + 200;
                if(offset >= nb_checkins) {
                    $scope.allcheck = false;
                } else {
                    $scope.getCheckins();
                }
            }).
            error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
    };
};
