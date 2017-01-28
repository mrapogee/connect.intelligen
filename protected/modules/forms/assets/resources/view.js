angular
    .module("formioApp", ["formio"])
    .run([
        "$rootScope",
        'formioComponents',
        '$timeout',
        function (
            $rootScope,
            formioComponents,
            $timeout
        ) {
            $rootScope.forms = {};
            $rootScope.submissions = {};
        }
    ]); 
