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
      when('/newsfeed', {
        templateUrl: 'templates/tutor/newsFeed.html',
        controller: 'NewsFeedController'
      }).
      when('/askaquestion', {
        templateUrl: 'templates/student/askAQuestion.html',
        controller: 'AskAQuestionController'
      }).
      
      otherwise({
        redirectTo: '/login'
      });
}]);

// when('/upcomingsessions', {
//         templateUrl: 'templates/tutorUpcomingSessions.html',
//         controller: 'UpcomingSessionsController'
//       }).
//       when('/sessionhistory', {
//         templateUrl: 'templates/sessionHistory.html',
//         controller: 'SessionHistoryController'
//       }).
//       when('/studentaccountsettings', {
//         templateUrl: 'templates/student/studentAccountSettings.html',
//         controller: 'StudentAccountSettingsController'
//       }).
//       when('/tutoraccountsettings', {
//         templateUrl: 'templates/tutor/tutorAccountSettings.html',
//         controller: 'TutorAccountSettingsController'
//       }).






