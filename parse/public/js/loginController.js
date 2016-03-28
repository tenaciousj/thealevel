aLevelApp.controller('LoginController', function($scope, $location) {

  var currentUser = Parse.User.current();
  //if someone is already logged in
  if(currentUser){
    if(currentUser.get("type") == "student"){
      $location.path("askaquestion");
      $scope.$apply();
    }
    else if(currentUser.get("type") == "tutor"){
      $location.path("newsfeed");
      $scope.$apply();
    }
  }
  
     
  $scope.dashboardLogIn = function() {
    var errorHTML = "";
    if(typeof $scope.email == "undefined" || $scope.email.indexOf("@") == -1 || $scope.email.indexOf(".") == -1){
      errorHTML += "Email not defined correctly. "
    }
    if(typeof $scope.password == "undefined"){
      errorHTML += " Password not defined correctly.";
    }

    //if an error occurred
    if(errorHTML != ""){
      $("#error").html(errorHTML);
      $("#error").css("color", "red");
    }
    //otherwise, log the person in!
    else{
      $("#error").html("");
      Parse.User.logIn($scope.email, $scope.password, {
        success: function(user){
          if(user.get("type") == "tutor"){
            $location.path("newsfeed");
          }
          else if (user.get("type") == "student"){
            $location.path("askaquestion");
          }
          $scope.$apply();
        },
        error: function(user, error){
          //Login failed
          $location.path("login");
          $("#error").html("Login failed. Please check your credentials");
          $scope.$apply();
        }
      });
    }
  };

  $scope.studentLogOut = function(){
    Parse.User.logOut();
  }
     
});