//Define an angular module for our app
var aLevelApp = angular.module('TheALevelApp', []);

//initialize Parse
Parse.initialize("QCoDICrJKN3wcGr8f1YY39X97IyepLRqUa5HWIEJ", "b4e33HPvTRsI8aZIvwMW9NefSJKYCr0jWevH6CMD");
 
//Define Routing for app
aLevelApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginController'
      }).
      when('/signup', {
        templateUrl: 'templates/signup.html',
        controller: 'SignUpController'
      }).
      when('/tutordashboard', {
        templateUrl: 'templates/tutor_dashboard.html',
        controller: 'TutorDashboardController'
      }).
      otherwise({
        redirectTo: '/login'
      });
}]);
 
aLevelApp.controller('LoginController', function($scope) {
     
     
});


aLevelApp.factory("coursesService", function($rootScope, $q){

  return {
    getCourses : function() {
      //$q is specific to Angular, made for async calls
      //For documentation on $q, look at
      //https://docs.angularjs.org/api/ng/service/$q
      var deferred = $q.defer();

      //query database for courses
      var coursesQuery = new Parse.Query(Parse.Object.extend("Subject"));
      coursesQuery.ascending("Department,Course_Number"); 

      coursesQuery.find({
        success: function(results){ 
          deferred.resolve(results);
          //update the view!!
          $rootScope.$apply();
        },
        error: function(error){
          console.log("Error in loading courses: " + error);
          deferred.reject(results);
          //update the view!!
          $rootScope.$apply();
        }
      });
      return deferred.promise;

    }
  }


});

aLevelApp.factory("majorsService", function($rootScope, $q){

  return {
    getMajors : function() {
      //$q is specific to Angular, made for async calls
      //For documentation on $q, look at
      //https://docs.angularjs.org/api/ng/service/$q
      var deferred = $q.defer();

      //query database for majors
      var majorsQuery = new Parse.Query(Parse.Object.extend("Major"));
      majorsQuery.ascending("Name");

      majorsQuery.find({
        success: function(results){
          deferred.resolve(results);
          //update the view!!
          $rootScope.$apply();
        },
        error: function(error){
          console.log("Error in loading majors: " + error);
          deferred.reject(results);
          //update the view!!
          $rootScope.$apply();
        }
      });
      return deferred.promise;

    }
  }


});

aLevelApp.controller('SignUpController', function($scope, coursesService, majorsService) {

  $scope.courses = [];

  //get the courses from db, then update $scope.courses
  coursesService.getCourses().then(
    function(results){
      if(results.length == 0){
        $scope.courses = ["No courses available"];
      }
      else {
        for(var i = 0; i < results.length; i++){
          $scope.courses.push(results[i].get("Department") + " " + results[i].get("Course_Number"));
        }
      }
    },
    function(error){
      $scope.courses = ["No courses available, database error"];
    }
  );

  $scope.majors = [];

  //get the majors from db, then update $scope.majors
  majorsService.getMajors().then(
    function(results){
      if(results.length == 0){
        $scope.majors = ["No majors available"];
      }
      else {
        for(var i = 0; i < results.length; i++){
          $scope.majors.push(results[i].get("Name"));
        }
      }
    },
    function(error){
      $scope.courses = ["No majors available, database error"];
    }
  );

  $scope.division = "";

  $scope.signUp = function() {
    var needsFillingOut = [];
    var firstName, lastName, email, password, majors, classYear, courses, division, phone, type;
    //validate information gathered from form
    if(typeof $scope.firstName == "undefined"){
      needsFillingOut.push("First Name");
    }
    else {
      firstName = capitalizeString($scope.firstName);
    }
    if(typeof $scope.lastName == "undefined"){
      needsFillingOut.push("Last Name");
    }
    else {
      lastName = capitalizeString($scope.lastName);
    }
    email = $scope.email;
    if(typeof email == "undefined"){
      needsFillingOut.push("Email");
    }
    password = $scope.password;
    if(typeof password == "undefined"){
      needsFillingOut.push("Password");
    }
    majors = $scope.majors.multipleSelect;
    if(typeof majors == "undefined"){
      needsFillingOut.push("Major");
    }
    classYear = $scope.classYear;
    if(typeof classYear == "undefined" || classYear.toString().length != 4 ){
      needsFillingOut.push("Class Year");
    }
    courses = $scope.courses.multipleSelect;
    if(typeof courses == "undefined"){
      needsFillingOut.push("Courses");
    }
    division = $scope.division.singleSelect;
    if(typeof division == "undefined"){
      needsFillingOut.push("Division");
    }
    phone = $scope.phone;
    if(typeof phone == "undefined"){
      needsFillingOut.push("Phone");
    }
    type = $scope.userType;
    if(typeof type == "undefined"){
      needsFillingOut.push("Type");
    }

    //if something wasn't filled in correctly
    if(needsFillingOut.length > 0){
      var html = "The following fields have not been entered correctly. Please fill them out and try again:<br>";
      for(var i = 0; i < needsFillingOut.length; i++){
        html += needsFillingOut[i];
        if(i != needsFillingOut.length - 1){
          html += ", ";
        }
        
      }
      $("#error").html(html);
      $("#error").css("color", "red");
    }

    //otherwise, there's no error
    else {
      $("#error").html("");
    }
  }

});





aLevelApp.controller('TutorDashboardController', function($scope) {
     
     
});

//helper function to make input more readable
function capitalizeString(str){
  var first = str.slice(0,1);
  var rest = str.slice(1, str.length);

  return first.toUpperCase() + rest.toLowerCase();
}
