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







