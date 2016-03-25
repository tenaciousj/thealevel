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
      when('/studentdashboard', {
        templateUrl: 'templates/student_dashboard.html',
        controller: 'StudentDashboardController'
      }).
      otherwise({
        redirectTo: '/login'
      });
}]);
 

aLevelApp.controller('LoginController', function($scope, $location) {
     
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
            $location.path("tutordashboard");
          }
          else if (user.get("type") == "student"){
            $location.path("studentdashboard");
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

 
/////////////////////////////////////////////////////////////////////////////////////////////////
aLevelApp.factory("subjectsService", function($rootScope, $q){

  return {
    getsubjects : function() {
      //$q is specific to Angular, made for async calls
      //For documentation on $q, look at
      //https://docs.angularjs.org/api/ng/service/$q
      var deferred = $q.defer();

      //query database for subjects
      var subjectsQuery = new Parse.Query(Parse.Object.extend("Subject"));

      subjectsQuery.find({
        success: function(results){ 
          deferred.resolve(results);
          //update the view!!
          $rootScope.$apply();
        },
        error: function(error){
          console.log("Error in loading subjects: " + error.message);
          deferred.reject(error);
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
          console.log("Error in loading majors: " + error.message);
          deferred.reject(error);
          //update the view!!
          $rootScope.$apply();
        }
      });
      return deferred.promise;

    }
  }


});

aLevelApp.controller('SignUpController', function($scope, $location, subjectsService, majorsService) {

  $scope.subjects = [];

  //get the subjects from db, then update $scope.subjects
  subjectsService.getsubjects().then(
    function(results){
      if(results.length == 0){
        $scope.subjects = ["No subjects available"];
      }
      else {
        for(var i = 0; i < results.length; i++){
          $scope.subjects.push(results[i].get("Name"));
        }
      }
    },
    function(error){
      $scope.subjects = ["No subjects available, database error"];
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
      $scope.subjects = ["No majors available, database error"];
    }
  );

  $scope.division = "";

  $scope.signUp = function() {
    var needsFillingOut = [];
    var firstName, lastName, email, password, majors, classYear, subjects, division, phone, type;
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
    //also check if @ and . symbols are in the email
    if(typeof email == "undefined" || email.indexOf("@") == -1 || email.indexOf(".") == -1){
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
    //also check that class year is a four digit number
    classYear = $scope.classYear;
    if(typeof classYear == "undefined" || classYear.toString().length != 4 ){
      needsFillingOut.push("Class Year");
    }
    subjects = $scope.subjects.multipleSelect;
    if(typeof subjects == "undefined"){
      needsFillingOut.push("subjects");
    }
    division = $scope.division.singleSelect;
    if(typeof division == "undefined"){
      needsFillingOut.push("Division");
    }
    phone = $scope.phone;
    if(typeof phone == "undefined"){
      needsFillingOut.push("Phone");
    }
    else {
      phone = parseInt($scope.phone);
    }
    type = $scope.userType;
    if(typeof type == "undefined"){
      needsFillingOut.push("Type");
    }

    //if something wasn't filled out correctly
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
    //sign this person up!
    else {
      //clear error div
      $("#error").html("");

      //make new Parse User
      var newUser = new Parse.User();
      
      //set new person's username to be email for now
      newUser.set("username", email);
      newUser.set("password", password);
      newUser.set("email", email);
      newUser.set("type", type);
      newUser.set("firstName", firstName);
      newUser.set("lastName", lastName);
      newUser.set("majors", majors);
      newUser.set("classYear", classYear);
      newUser.set("subjects", subjects);
      newUser.set("division", division);
      newUser.set("phoneNumber", phone);

      newUser.signUp(null, {
        success: function(user) {
          // Hooray! new user signed up successfully

          console.log("Signing up of new user successful!");
          if(type == "tutor"){
            $location.path("tutordashboard");
          }
          else if(type == "student"){
            $location.path("studentdashboard");
          }
          $scope.$apply();


        },
        error: function(user, error){
          // Show the error message somewhere and let the user try again.
          alert("Error in signing up new user: " + error.code + " " + error.message);
        }

      });


    }
  }

});

/////////////////////////////////////////////////////////////////////////////////////////////////
aLevelApp.controller('TutorDashboardController', function($scope, $location) {
     var currentUser = Parse.User.current();
     
     $scope.messages = [];
     $scope.filters = [];

     if(!currentUser || currentUser.get("type") != "tutor"){
        //no one is signed in, go to login page
        $location.path("login");
        $scope.$apply();
     }
     else{
      //LOAD MESSAGES//
      var messageClass = Parse.Object.extend("Message");
      var messageQuery = new Parse.Query(messageClass);

      var subjectList = currentUser.get("subjects");
      

      //order by date created (older ones should go first)
      messageQuery.ascending("createdAt");

     
      messageQuery.find({
        success: function(results){
          console.log("Messages successfully retrieved from database");
          //hide loading gif
          $("#messageLoad").css("display", "none");

          //if there are no messages
          if(results.length == 0){
            $scope.messages[0] = {"header":"No messages found"};
            $scope.$apply();
          }
          //otherwise, prepare the messages
          else {

            for(var i = 0; i < results.length; i++){

              //if any of these matches any of the user's subjects
              //we don't want to display messages that this specific tutor
              //doesn't specialize in
              var subjectListOfResults = results[i].get("subjects");
              if(findOne(subjectListOfResults, subjectList)){
                var obj = {};
                var createdAt = new Date();
                createdAt = results[i]["createdAt"];

                obj["header"] = results[i].get("header");
                obj["createdAt"] = createdAt.toDateString() + " " + formatAMPM(createdAt);
                obj["content"] = results[i].get("content");

                $scope.messages.push(obj);
              }
              
              
            }
            $scope.$apply();

          }
        },
        error: function(error){
          console.log("Error in startLoadMessages(): " + error);
          $scope.messages[0] = {"header":"No messages found, database error"};
          $scope.$apply();
        }
      });
      ////LOAD FILTERS////
      var subjectClass = Parse.Object.extend("Subject");
      var subjectQuery = new Parse.Query(subjectClass);

      //sort by name
      subjectQuery.ascending("Name");

      subjectQuery.find({
        success: function(results){
          console.log("Filters successfully retrieved from database");

          //delete loading filter
          $("#filterLoad").css("display", "none");


          if(results.length == 0){
            $scope.filters[0] = {"name":"No filters found"};
            $scope.$apply();
          }
          else {
            for(var i = 0; i < results.length; i++){

              if(subjectList.indexOf(results[i].get("Name")) > -1){
                var obj = {};
                var name = results[i].get("Name");

                obj["id"] = name;
                obj["name"] = name;
                $scope.filters.push(obj);
              }
            }
            $scope.$apply();
          }
        },
        error: function(error){
          console.log("Error in startLoadFilters(): " + error);
          $scope.filters[0] = {"name":"No filters found"};
          $scope.$apply();
        }
      });
    }

    $scope.filterMessages = function(){

      var checkboxes = document.getElementsByClassName("checkboxes");
      var filterList = [];
      for(var i = 0; i < checkboxes.length; i++){
        if(checkboxes[i].checked){
          filterList.push(checkboxes[i].id);
        }
      }
      //nothing is checked, we want all possible options
      if(filterList.length == 0){
        for(var i = 0; i < checkboxes.length; i++){
          filterList.push(checkboxes[i].id);
        }
      }
      //apply the checked filters
      $scope.applyFilters(filterList);
      
    };

    $scope.applyFilters = function(filterList){
      
      //we are going to query the messages to see which ones have the selected subjects
      var messageQuery = new Parse.Query(Parse.Object.extend("Message"));
      

      messageQuery.ascending("createdAt");

      messageQuery.find({
        success: function(results){
          //if we find messages
          console.log("Messages with filters successfully retrieved from database");
          //no messages
          if(results.length == 0){
            $scope.messages[0] = {"header":"No messages with such filters available"};
            $scope.$apply();
          }
          else {
            debugger;
            $scope.messages = [];
            for(var i = 0; i < results.length; i++){
              var subjectListOfResults = results[i].get("subjects");
              if(findOne(subjectListOfResults, filterList)){
                var obj = {};
                var createdAt = new Date();
                createdAt = results[i]["createdAt"];

                obj["header"] = results[i].get("header");
                obj["createdAt"] = createdAt.toDateString() + " " + formatAMPM(createdAt);
                obj["content"] = results[i].get("content");

                $scope.messages.push(obj);
              }
            }
            if($scope.messages.length == 0){
              $scope.messages[0] = {"header":"No messages with that filter"};
            }
            $scope.$apply();
          }
        },
        error: function(error){
          //database error
          console.log("Error in applyFilters(): " + error);
          $scope.messages[0] = {"header":"No messages with such filters available, database error"};
          $scope.$apply();
        }
      }); 
    };


    //log tutor out
    $scope.tutorLogOut = function () {
      Parse.User.logOut();

    }
     
});

/////////////////////////////////////////////////////////////////////////////////////////////////
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

//HELPER FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////

//helper function to make input more readable
function capitalizeString(str){
  var first = str.slice(0,1);
  var rest = str.slice(1, str.length);

  return first.toUpperCase() + rest.toLowerCase();
}

//helper function to convert to AM/PM in loadMessagesHTML()
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

//sees if any element of arr matches any element of haystack
//will use in TutorDashboardController
var findOne = function (haystack, arr) {
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });
};



