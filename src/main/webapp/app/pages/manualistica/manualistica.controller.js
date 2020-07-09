(function() {
    'use strict';

    angular
        .module('sprintApp')
        .controller('ManualisticaController', ManualisticaController);

    ManualisticaController.$inject = ['$scope', '$state', 'dataService', 'utils'];

    function ManualisticaController($scope, $state, dataService, utils) {
        var vm = this;
        //Recupero i Manuali
        dataService.manuali.getElenco().then(function(response) {
            vm.manuali = response.data;
        });
        //Recupero le Faq readable (generiche)
        dataService.faq.getReadableForProcessDefinition('generiche').then(function (faqs) {
            vm.faqs = removePrefix(faqs.data);
        });

        $scope.downloadManuale = function (manuale) {
            dataService.manuali.getManuale(manuale).then(
                function (response) {
                    var file = new Blob([response.data], {
                        type: "application/pdf"
                    });
                    saveAs(file, manuale + ".pdf");
                }
            )
        }
        //Recupero le Faq readable (specifiche)
        $scope.searchFaq = function() {
            if (vm.processDefinitionKey) {
                dataService.faq.getReadableForProcessDefinition(vm.processDefinitionKey).then(function (specificFaqs) {
                    var splitStr = vm.processDefinitionKey.replace(/\-/g, " ").split(' ');
                    //rimpiazzo "-" con spazi e le prime lettere delle parose maiuscole
                    for (var i = 0; i < splitStr.length; i++) {
                       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
                    }
                    //riassemblo myProcessDefinitionKey (con le prime lettere maiuscole e senza -)
                    vm.myProcessDefinitionKey = splitStr.join(' ');

                    //rimuovo il prefisso delle domande delle Faq
                    vm.specificFaqs = removePrefix(specificFaqs.data);
                });
            }
        };
        // setto vm.specificFaqs vuoto
        $scope.$watchGroup(["vm.processDefinitionKey"], function () {
            if(!vm.processDefinitionKey)
                vm.specificFaqs = {};
        });
        // rimuovo il prefisso (la process definition) presente nele domande delle faq
        function removePrefix(faqs) {
            var faqsWithoutPrefix = $.extend({}, faqs), key;
            for (key in faqs) {
                faqsWithoutPrefix[key].domanda = faqs[key].domanda.substring(faqs[key].domanda.indexOf(' - ') + 2);
            }
            return faqsWithoutPrefix;
        }
    }
})();