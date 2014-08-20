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

    $scope.getCheckins = function()
    {
        $http({method: 'GET', url: '/checkins' }).
            success(function(data, status, headers, config) {
                var checkins_items = data.data.checkins.items;
                checkins_items.forEach(function(checkins_item) {
                    var lat = checkins_item.venue.location.lat;
                    var lng = checkins_item.venue.location.lng;
                    var name = checkins_item.venue.name;

                    $rootScope.$broadcast('add.foursquareMarkers', {lat: lat, lng: lng, name: name});
                });
            }).
            error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
    };
};
