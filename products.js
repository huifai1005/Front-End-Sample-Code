//routing
(function () {
    "use strict";

    angular.module(APPNAME)
       .config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {

           $locationProvider.hashPrefix('!');

           $routeProvider.when('/', {
               templateUrl: '/Scripts/app/templates/join/addons.html',
               controller: 'addOnController',
               controllerAs: 'addon'
           }).when('/lashpick', {
               templateUrl: '/Scripts/app/templates/join/lashpick.html',
               controller: 'lashPickController',
               controllerAs: 'lash'
           }).when('/healthPick', {
               templateUrl: '/Scripts/app/templates/join/healthPick.html',
               controller: 'healthController',
               controllerAs: 'health'
           }).when('/shipping', {
               templateUrl: '/Scripts/app/templates/join/shipping.html',
               controller: 'joinController',
               controllerAs: 'join'
           }).when('/summary', {
               templateUrl: '/Scripts/app/templates/join/summary.html',
               controller: 'summaryController',
               controllerAs: 'summary'
           });

           $locationProvider.html5Mode({
               enabled: false,
               requireBase: false
           });

       }]);


})();

(function () {
    "user strict";
    angular.module(APPNAME).controller('joinHeaderController', JoinHeaderController);

    JoinHeaderController.$inject = ['$scope', '$window', '$baseController'];

    function JoinHeaderController($scope, $window, $baseController) {
        var vm = this;

        vm.$scope = $scope;
        $baseController.merge(vm, $baseController);
        vm.$window = $window;

        vm.header = "Choose Your Add-Ons"

        vm.$onInit = _render;

        function _render() {
            vm.$systemEventService.listen('addon', _onSystemEvent);
            vm.$systemEventService.listen('healthPick', _onSystemEvent);
            vm.$systemEventService.listen('lashpick', _onSystemEvent);
            vm.$systemEventService.listen('join', _onSystemEvent);
        }

        function _onSystemEvent(event, payload) {
            vm.header = payload[1];
        }
    }

})();




