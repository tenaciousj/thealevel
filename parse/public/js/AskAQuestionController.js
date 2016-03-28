//for date and time pickers
var pickerNum = 2;

aLevelApp.controller('AskAQuestionController', function($scope, $location, meetingPlacesService) {

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
  	var header, question, subjects, meetingPlaces;
    var meetingTimes = [];
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

    
  	var dates = document.getElementsByClassName("datepicker");
    for(var i = 0; i < dates.length; i++){
      var dateID = dates[i]["id"];
      var inputDate = $("#"+dateID).datepicker("getDate");
      if(inputDate == null){
        needsFillingOut.push("Meeting Times");
        break;
        //break out of loop, not all valid dates/times anyways
      }
      else{
        var timeID = "time_"+dateID.slice(dateID.indexOf("_")+1, dateID.length);
        var inputTime = $("#"+timeID).val();
        meetingTimes.push(makeNewDate(inputDate, inputTime));
      }
    }
    //if it is empty and we haven't kept track of that
    if(meetingTimes.length == 0 && needsFillingOut.indexOf("Meeting Times") == -1){
      needsFillingOut.push("Meeting Times");
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
    //store in database!
    else{
    	$("#error").html("");

      var Message = Parse.Object.extend("Message");
      var newMessage = new Message();

      newMessage.set("subjects", subjects);
      newMessage.set("header", header);
      newMessage.set("content", question);
      newMessage.set("meetingPlaces", meetingPlaces);
      newMessage.set("userPointer", Parse.User.current());
      newMessage.set("meetingTimes", meetingTimes);

      //save new message in database
      newMessage.save(null, {
        success: function(result){
          $("#submitMsg").html("Your message was successfully submitted!");

        },
        error: function(result, error){
          $("#submitMsg").html("Your message was not successfully submitted. Please wait and try again later.");
          console.log("Error in saving new message: " + error);
        }

      });


    }
  };




  $scope.addPickers = function() {

  	var timeP = "time_"+pickerNum;
	  var dateP = "date_"+pickerNum;
    var rem = "remPicker"+pickerNum;
    var dt = "dt"+pickerNum;
    var newHTML = "<div id='"+dt+"'>"+
                  "<input data-provide='datepicker' id='"+dateP+"' class='datepicker'>"+
                  "&nbsp"+
                  "<input id='"+timeP+"' type='text' class='input-small timepicker'>"+
                  "&nbsp"+
                  "<button id='"+rem+"' class='btn btn-link'><i class='fa fa-minus-circle fa-lg'></i></button>"+
                  "</div>";

    $("#dateAndTimePickers").append(newHTML);
										            
  	//initialize date and time pickers
  	$("#"+timeP).timepicker({
        template: false,
        showInputs: false,
        minuteStep: 5
    });
    $("#"+dateP).datepicker();

    $("#"+rem).click(function(){
      $("#"+dt).remove();
    });

    //increment pickerNum
    pickerNum++;

  };
  //log student out
  $scope.studentLogOut = function () {
    Parse.User.logOut();
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

function makeNewDate(date, strTime){
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();

  var meridium = strTime.slice(-2).toUpperCase();
  var hourNoMer = parseInt(strTime.slice(0, strTime.indexOf(":")));

  var hour = meridium == "PM" ? hourNoMer+11 : hourNoMer;
  var min = parseInt(strTime.slice(strTime.indexOf(":")+1, strTime.indexOf(":")+3));

  var newDate = new Date(year, month, day, hour, min, 0, 0);
  return newDate.toLocaleString();
}

