//for date and time pickers
var pickerNum = 2;

aLevelApp.controller('StudentDashboardController', function($scope, $location, meetingPlacesService) {

  var currentUser = Parse.User.current();

  //if the user isn't logged in or if they're not a student
  //don't let them look
  if(!currentUser || currentUser.get("type") != "student"){
    //no one is signed in, go to login page
    $location.path("login");
    $scope.$apply();
  }
  //they're logged in and a student!
  else {

  	//initialize date and time pickers
  	$('#time_1').timepicker({
        template: false,
        showInputs: false,
        minuteStep: 5
    });
    $('#date_1').datepicker();


  	//get subjects to show
  	$scope.subjects = currentUser.get("subjects");
  	$scope.meetingPlaces = [];
  	$scope.meetingTimes = {};

  	//get the meeting places from db, then update $scope.meetingPlaces
	meetingPlacesService.getMeetingPlaces().then(
	  function(results){
	    if(results.length == 0){
	      $scope.meetingPlaces = ["No meeting places available"];
	    }
	    else {
	      for(var i = 0; i < results.length; i++){
	        $scope.meetingPlaces.push(results[i].get("Name"));
	      }
	    }
	  },
	  function(error){
	    $scope.meetingPlaces = ["No meeting places available, database error"];
	  }
	);
  }

  $scope.askQuestion = function(){
  	var header, question, subjects, meetingPlaces, meetingTimes;
  	var needsFillingOut = [];

  	//validating information
  	if(typeof $scope.header == "undefined"){
  		needsFillingOut.push("Header");
  	}
  	else{
  		header = $scope.header;
  	}
  	if(typeof $scope.question == "undefined"){
  		needsFillingOut.push("Question");
  	}
  	else{
  		question = $scope.question;
  	}
  	if(typeof $scope.subjects.multipleSelect == "undefined" || $scope.subjects.multipleSelect.length == 0){
  		needsFillingOut.push("Subjects");
  	}
  	else{
  		subjects = $scope.subjects.multipleSelect;
  	}
  	if(typeof $scope.meetingPlaces.multipleSelect == "undefined" || $scope.meetingPlaces.multipleSelect.length == 0){
  		needsFillingOut.push("Meeting Places");
  	}
  	else{
  		meetingPlaces = $scope.meetingPlaces.multipleSelect;
  	}
  	//allFalse checks if all the checkbox values are false (aka nothing is selected)
  	if(typeof $scope.meetingTimes == "undefined"){
  		needsFillingOut.push("Meeting Times");
  	}
  	else {

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
    //everything was filled correctly
    else{
    	$("#error").html("");
    }
  };

  $scope.addPickers = function() {
  	//remove + button for now, will add at the end
  	var addPickerBtn = document.getElementById("addPickerBtn");
  	$("#addPickerBtn").remove();

  	var timeP = "#time_"+pickerNum;
	var dateP = "#date_"+pickerNum;	
  	document.getElementById("dateAndTimePickers").innerHTML += "<input data-provide='datepicker' id='"+dateP+"' class='datepicker'>"+
													      		"&nbsp;"+
													            "<input id='"+timeP+"' type='text' class='input-small'>"+
													            "<i class='icon-time'></i>"+
													            "&nbsp;";

	
  	
  	document.getElementById("dateAndTimePickers").appendChild(addPickerBtn);											            
  	//initialize date and time pickers
  	$(timeP).timepicker({
        template: false,
        showInputs: false,
        minuteStep: 5
    });
    $(dateP).datepicker();
    pickerNum++;
  }

});

aLevelApp.factory("meetingPlacesService", function($rootScope, $q){

  return {
    getMeetingPlaces : function() {
      //$q is specific to Angular, made for async calls
      //For documentation on $q, look at
      //https://docs.angularjs.org/api/ng/service/$q
      var deferred = $q.defer();

      //query database for majors
      var majorsQuery = new Parse.Query(Parse.Object.extend("MeetingPlaces"));
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

