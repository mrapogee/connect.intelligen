angular
    .module("formBuilder", ["formio", "ngFormBuilder"])
    .run([
      "$rootScope",
      'formioComponents',
      '$timeout',
      '$http',
      function(
        $rootScope,
        formioComponents,
        $timeout,
        $http
      ) {
        /* global loadedForm, loadedBranchId, loadedBranch */

        $rootScope.saved = true;

        $rootScope.details = {
          branchName: loadedBranch.name,
          formName: loadedForm.name
        }

        $rootScope.selectedForm = loadedForm && loadedForm._id;

        // Swap form by redirecting
        $rootScope.$watch('selectedForm', function (newValue) {
          const isLoaded = loadedForm && loadedForm._id === newValue
          if (newValue && newValue.length > 0 && !isLoaded) {
            window.location.href = '?form=' + newValue
          }
        })

        // Display correct selected branch
        $rootScope.selectedBranch = loadedBranchId

        // Allow switching between form and wizard (multi-page) mode
        $rootScope.displays = [{
          name: 'form',
          title: 'Form'
        }, {
          name: 'wizard',
          title: 'Wizard'
        }];

        $rootScope.$watch('form.display', (newValue) => {
          $rootScope.saved = $rootScope.saved && newValue === loadedBranch.form.display
        })

        // Setup the form in the scope
        $rootScope.form = angular.copy(loadedBranch.form)
        $rootScope.renderForm = true;

        $rootScope.$watch('details.formName', (newValue) => {
          $rootScope.saved = $rootScope.saved 
            && newValue === loadedForm.name
        })

        $rootScope.$watch('details.branchName', (newValue) => {
          $rootScope.saved = $rootScope.saved 
            && newValue === loadedBranch.name
        })

        // Merge new form, checkig if we are no longer saved
        $rootScope.$on('formUpdate', function(event, form) {
            $rootScope.saved = angular.equals(form, loadedBranch.form);
            angular.merge($rootScope.form, form);
        });

        var url = window.builderSaveUrl;
        $rootScope.save = function () {
            loadedBranch.form = angular.copy($rootScope.form)
            loadedBranch.name = $rootScope.details.branchName
            loadedForm.name = $rootScope.details.formName

            var headers = {'Content-Type': 'application/json'}

            var queryResponse
            if (loadedForm._id) {
              // Save branch
              queryResponse = $http({
                url: url + '/' + loadedForm._id + '/branch/' + loadedBranchId,
                method: 'PATCH',
                data: JSON.stringify(loadedBranch),
                headers: headers
              }).then(function (result) {
                // Save Form details
                return $http({
                    url: url + '/' + loadedForm._id,
                    method: 'PATCH',
                    data: JSON.stringify({name: loadedForm.name}),
                    headers: headers
                })
              })            
              } else {
              // Save the full form
              queryResponse = $http({
                  url: url,
                  method: 'POST',
                  data: JSON.stringify(loadedForm),
                  headers: headers
              })            
            }

            queryResponse.then(function (result) {
                loadedForm._id = loadedForm.id = result.data._id || result.data.id
                $rootScope.saved = true
            }).catch(function (error) {
              console.error(error) 
              alert('There was a unkown problem saving your form.')
            })
        }
        // When saved is false, the user will be warned before exiting
        window.addEventListener("beforeunload", function (e) {
          if ($rootScope.saved) {
            return
          }

          var exitMessage = 'Your form is unsaved. Are you sure you want to exit?'

          e.returnValue = exitMessage
          return exitMessage
        });
      }
    ]);
