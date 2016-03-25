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


//helper function to make input more readable
function capitalizeString(str){
  var first = str.slice(0,1);
  var rest = str.slice(1, str.length);

  return first.toUpperCase() + rest.toLowerCase();
}