aLevelApp.controller('StudentDashboardController', function($scope, $location) {

  var currentUser = Parse.User.current();

  if(!currentUser || currentUser.get("type") != "student"){
    //no one is signed in, go to login page
    $location.path("login");
    $scope.$apply();
  }
  else {

  }
});