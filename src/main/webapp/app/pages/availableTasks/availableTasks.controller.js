(function () {
    'use strict';

    angular
        .module("sprintApp")
        .controller("AvailableTasksController", AvailableTasksController);

    AvailableTasksController.$inject = ['$scope', '$rootScope', 'paginationConstants', 'dataService', 'utils', '$log', '$location'];

    function AvailableTasksController($scope, $rootScope, paginationConstants, dataService, utils, $log, $location) {
        var vm = this;
        vm.searchParams = {};
        $scope.indextab = 1;

        if ($rootScope.fromState.url.includes('details?')) {
            //Carico i parametri di ricerca "salvati" se torno dalla pagine dei "details"
            vm.searchParams = $location.search();
            vm.active = $location.active;
            vm.activeContent = $location.activeContent;
            vm.order = $location.order;
            switch ($location.activeContent) {
                case 'myTasks':
                    vm.myPage = $location.page;
                    vm.availablePage = 1;
                    vm.TAIMGPage = 1;
                    $scope.indextab = 0;
                    break;
                case 'availables':
                    vm.availablePage = $location.page;
                    vm.myPage = 1;
                    vm.TAIMGPage = 1;
                    $scope.indextab = 1;
                    break;
                case 'taskAssignedInMyGroups':
                    vm.TAIMGPage = $location.page;
                    vm.availablePage = 1;
                    vm.myPage = 1;
                    $scope.indextab = 2;
                    break;
            }

            //carico la form url
            $scope.formUrl = $location.formUrl || null;
            vm.processDefinitionKey = $location.processDefinitionKey;
        } else {
            //nella ricerca di default (quando carico la pagina) NON devo settare i searchParams
            vm.active = true;
            vm.order = 'ASC';
            $scope.formUrl = utils.loadSearchFields(vm.processDefinitionKey, true);
        }

        //se le variabili usate per la paginazione no/*  */n sono inizializzate le inizializzo,
        //altrimenti se sto tornando dalla pagina dei dettagli una di loro sarà già inizializzata
        if (!(vm.myPage || vm.availablePage || vm.TAIMGPage))
            $location.page = vm.myPage = vm.availablePage = vm.TAIMGPage = 1;

        // JSON che conterrà i risultati delle due query
        vm.myTasks = {
            total: 0,
        };
        vm.availableTasks = {
            total: 0,
        };
        vm.taskAssignedInMyGroups = {
            total: 0,
        };

        $scope.loadMyTasks = function () {
            // variabili usate nella paginazione
            var myFirstResult, myMaxResults;

            // carico le form di ricerca specifiche per ogni tipologia di Process Definitions e le salvo in $location
            $location.formUrl = $scope.formUrl = utils.loadSearchFields(vm.processDefinitionKey, true);

            vm.itemsPerPage = paginationConstants.itemsPerPage;
            vm.myTotalItems = vm.itemsPerPage * vm.myPage;
            myFirstResult = vm.itemsPerPage * (vm.myPage - 1);
            myMaxResults = vm.itemsPerPage;

            dataService.tasks
                .myTasks(
                    vm.processDefinitionKey,
                    myFirstResult,
                    myMaxResults,
                    vm.order,
                    utils.populateTaskParams(vm.searchParams)
                )
                .then(
                    function (response) {
                        utils.refactoringVariables(response.data.data);
                        vm.myTasks = response.data;
                        // variabili per la gestione della paginazione
                        vm.myTotalItems = response.data.total;
                        vm.myQueryCount = vm.myTotalItems;
                    },
                    function (response) {
                        $log.error(response);
                    }
                );
        };

        $scope.loadAvailableTasks = function () {
            // variabili usate nella paginazione
            var firstResultAvailable, maxResultsAvailable;
            vm.itemsPerPage = paginationConstants.itemsPerPage;
            vm.availableTotalItems = vm.itemsPerPage * vm.availablePage;
            firstResultAvailable = vm.itemsPerPage * (vm.availablePage - 1);
            maxResultsAvailable = vm.itemsPerPage;

            dataService.tasks
                .myTasksAvailable(
                    vm.processDefinitionKey,
                    firstResultAvailable,
                    maxResultsAvailable,
                    vm.order,
                    utils.populateTaskParams(vm.searchParams)
                )
                .then(
                    function (response) {
                        utils.refactoringVariables(response.data.data);
                        vm.availableTasks = response.data;
                        // variabili per la gestione della paginazione
                        vm.availableTotalItems = response.data.total;
                        vm.availableQueryCount = vm.availableTotalItems;
                    },
                    function (response) {
                        $log.error(response);
                    }
                );
        };

        $scope.loadTaskAssignedInMyGroups = function () {
            // variabili usate nella paginazione
            var firstResultTAIMG, maxResultsTAIMG;
            vm.itemsPerPage = paginationConstants.itemsPerPage;
            vm.TAIMGTotalItems = vm.itemsPerPage * vm.availablePage;
            firstResultTAIMG = vm.itemsPerPage * (vm.availablePage - 1);
            maxResultsTAIMG = vm.itemsPerPage;

            dataService.tasks
                .taskAssignedInMyGroups(
                    vm.processDefinitionKey,
                    firstResultTAIMG,
                    maxResultsTAIMG,
                    vm.order,
                    utils.populateTaskParams(vm.searchParams)
                )
                .then(
                    function (response) {
                        utils.refactoringVariables(response.data.data);
                        vm.taskAssignedInMyGroups = response.data;
                        // variabili per la gestione della paginazione
                        vm.TAIMGTotalItems = response.data.total;
                        vm.TAIMGQueryCount = vm.TAIMGTotalItems;
                    },
                    function (response) {
                        $log.error(response);
                    }
                );
        };

        $scope.showProcessInstances = function (requestedPage) {
            //"salvo" i parametri di ricerca
            $location.search(vm.searchParams);
            $location.processDefinitionKey = vm.processDefinitionKey;
            $location.order = vm.order;
            $location.active = vm.active;
            // Se RICARICO la pagina aggiorno TUTTE le "viste" (i miei compiti, compiti di gruppo,
            // compiti dei miei gruppi assegnati ad altri) e cancello i searchParams
            if (performance.navigation.type == performance.navigation.TYPE_RELOAD || performance.navigation.type == performance.navigation.TYPE_NAVIGATE) {
                $scope.loadAllTasks();
            } else {
                switch (vm.activeContent) {
                    case 'myTasks':
                        $scope.loadMyTasks();
                        vm.availablePage = vm.TAIMGPage = 1;
                        break;
                    case 'availables':
                        $scope.loadAvailableTasks();
                        vm.myPage = vm.TAIMGPage = 1;
                        break;
                    case 'taskAssignedInMyGroups':
                        $scope.loadTaskAssignedInMyGroups();
                        vm.availablePage = vm.myPage = 1;
                        break;
                }
            }
        };

        $scope.loadAllTasks = function () {
            $scope.loadMyTasks();
            $scope.loadAvailableTasks();
            $scope.loadTaskAssignedInMyGroups();
        };

        $scope.setActiveContent = function (choice, fromStateUrl) {
            if (!fromStateUrl.includes('details?'))
                vm.activeContent = $location.activeContent = choice;
        };

        $scope.resetSearcParams = function () {
            vm.searchParams = {};
            vm.processDefinitionKey = '';
            vm.order = 'ASC';
            vm.active = true;
            $scope.showProcessInstances();
        };

        // aggiornamento pagina in caso di cambio "ordinamento" o Process definition
        $scope.$watchGroup(['vm.order'], function () {
            $scope.showProcessInstances();
        });

        // funzione richiamata quando si chiede una nuova "pagina" dei risultati
        vm.transition = function transition(page) {
            $scope.showProcessInstances();
            $location.page = page;
        };
    }
})();