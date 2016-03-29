
aLevelApp.controller('NewsFeedController', function($scope, $location) {
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
                obj["student"] = results[i].get("userPointer");
                obj["meetingTimes"] = results[i].get("meetingTimes");
                obj["meetingPlaces"] = results[i].get("meetingPlaces");

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
                obj["student"] = results[i].get("userPointer");
                obj["meetingTimes"] = results[i].get("meetingTimes");
                obj["meetingPlaces"] = results[i].get("meetingPlaces");
                debugger;
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

    
    $scope.lookAtQuestion = function(message) {
      $scope.question = {};

      //hide newsfeed for now
      $("#newsFeedContainer").css("display", "none");

      //show confirmation page
      $("#acceptSessionContainer").css("display", "block");

      $scope.question["studentID"] = message["student"]["id"];

      var studentQuery = new Parse.Query(Parse.User);
      studentQuery.equalTo("objectId", message["student"]["id"]);
      studentQuery.first({
        success: function(result) {
          console.log("Successfully retrieved asker");
          $("#acceptSessionLoad").css("display", "none");
          $("#acceptSession").css("display", "block");
          $scope.question["student"] = result.get("firstName") + " " + result.get("lastName");
          $scope.$apply();
        },
        error: function(error) {
          alert("Error in finding asker: " + error.code + " " + error.message);
          $("#acceptSessionLoad").css("display", "none");
          $("#acceptSession").html("Database error. Please try again later.");
        }

      });

      $scope.question["header"] = message["header"];
      $scope.question["content"] = message["content"];
      $scope.question["meetingTimes"] = message["meetingTimes"];
      $scope.question["meetingPlaces"] = message["meetingPlaces"];
    };

    $scope.acceptQuestion = function(question) {
      var needsFillingOut = [];

      //comments are optional
      var comments = $scope.question["comments"];
      var meetingPlace, meetingTime;

      if(typeof $scope.question["mp"] == "undefined"){
        needsFillingOut.push("Meeting Place");
      }
      else{
        meetingPlace = $scope.question["mp"];
      }
      if(typeof $scope.question["mt"] == "undefined"){
        needsFillingOut.push("Meeting Time");
      }
      else{
        meetingTime = $scope.question["mt"];
      }

      //if they haven't filled everything out
      if(needsFillingOut.length > 0){
        var html = "Please fill out the following sections: ";
        for(var i = 0; i < needsFillingOut.length; i++){
          html+= needsFillingOut[i];
          if(i!=needsFillingOut.length-1){
            html+=", ";
          }
        }
        $("#errorBlock").html(html);
      }
      //otherwise, accept the tutoring session!
      else{
        //make a new session
        $("#errorBlock").html("");


      }

    }

    $scope.cancelAccept = function(){
      $("#acceptSessionLoad").css("display", "block");
      $("#newsFeedContainer").css("display", "block");
      $("#acceptSessionContainer").css("display", "none");
    };

    //log tutor out
    $scope.tutorLogOut = function () {
      Parse.User.logOut();

    };
     
});


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