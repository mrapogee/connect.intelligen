<style>
.formbuilder {
  height: 600px;
}

.formcomponents {
  width: 30%;
}

.formarea {
  width: 70%;
}

.component-settings .nav-link {
  font-size: 0.6em;
}

.jsonviewer {
  max-height: 600px;
  overflow: scroll;
}

.form-type-select {
  display: inline-block;
  width: 100px;
  height: 28px;
  vertical-align: top;
} 

.form-note {
  margin-bottom: 20px;
}

</style>

<div class="form-note">
  <?= humhub\widgets\RichText::widget(['text' => $formRequest->note]); ?>
</div>

<div id="form-request-<?= $form['id'] ?>">
  <formio submission='submissions[<?= json_encode((string) $formRequest->id) ?>]' form='forms[<?= json_encode($form['id']) ?>]'></formio>
</div>

<script>

 angular.injector(['ng', 'formioApp']).invoke(['$compile', '$rootScope', '$http', function($compile, $rootScope, $http) {
   $rootScope.forms[<?= json_encode($form['id']) ?>] = <?=json_encode($form['form']) ?>;
   $rootScope.submissions[<?= json_encode((string) $formRequest->id) ?>]  = {
     _id: <?= json_encode((string) $formRequest->id) ?>,
     data: <?= json_encode($submission) ?>
    };

    $compile(document.getElementById("form-request-" + <?= json_encode($form['id']) ?>))($rootScope)

    $rootScope.$on('formSubmission', (e, sub) => {
      if (sub._id === <?= json_encode((string) $formRequest->id) ?>) {
        var method = 'PUT';
        $http({
          url: <?= json_encode($submitUrl) ?>,
          data: JSON.stringify(sub),
          method: method,
          headers: {'Content-Type': 'application/json'}
        }).then(function() {
          $rootScope.$broadcast('submitDone', sub, 'Successfully Submitted!');
        }).catch(function() {
          $rootScope.$broadcast('submitError', 'Oops, there was a problem submitting.');
        })
      }
    })
 }])

</script>