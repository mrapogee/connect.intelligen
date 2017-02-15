<?php

use yii\helpers\Html;

?>

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
  min-height: 5px;
}

.form-wall-panels {
  background-color: #fafafa;
  margin: 10px -10px;
  padding: 10px;
}

</style>

<div class="form-note">
  <?= humhub\widgets\RichText::widget(['text' => $formRequest->note]); ?>
</div>

<div class="form-wall-entry">

  <div id="package-<?= $formRequest->id ?>" class="panel-group form-wall-panels">

    <?php foreach ($items as $index => $item): ?>
      <div class="panel panel-info">
      <?php if ($item->type === 'form'): ?>
          <div class="panel-heading">
            <?= Html::encode($item->label) ?>
          </div>

          <div class="panel-body">
            <formio submission="{_id: {_item: <?= $index ?>, _request: <?= $formRequest->id ?>, _formId: <?= htmlspecialchars(json_encode($item->formId)) ?>, _branchId: <?= htmlspecialchars(json_encode($item->itemValue['branch'])) ?>}, data: <?= htmlspecialchars(json_encode($item->itemValue['submission'])) ?>}" form="<?= htmlspecialchars(json_encode($item->itemValue['form'])) ?>"></formio>
          </div>
      <?php elseif ($item->type === 'approve'): ?>
        <?php $item->itemValue['form']['_id'] = (string) $formRequest->id . $item->threadId; ?>

        <div class="panel-heading">
         <?= Html::encode($item->label) ?> from <strong><?= Html::encode($item->itemValue['user']->getDisplayName()) ?></strong>
        </div>

        <div class="panel-body">
        <formio-submission submission="{_id: {_item: <?= $index ?>, _request: <?= $formRequest->id ?>, _formId: <?= htmlspecialchars(json_encode($item->formId)) ?>, _branchId: <?= htmlspecialchars(json_encode($item->itemValue['branch'])) ?>}, data: <?= htmlspecialchars(json_encode($item->itemValue['submission'])) ?>}" form="<?= htmlspecialchars(json_encode($item->itemValue['form'])) ?>"></formio-submission>

        <button class="btn btn-primary" ng-click="approve({_item: <?= $index ?>, _request: <?= $formRequest->id ?>, data: true})">Approve</button>
        </div>

      <?php elseif ($item->type === 'submission'): ?>
        <?php $item->itemValue['form']['_id'] = (string) $formRequest->id . $item->threadId; ?>

        <div class="panel-heading">
          <strong><?= Html::encode($item->itemValue['user']->getDisplayName()) ?>'s</strong> <?= Html::encode($item->label) ?>
        </div>

        <div class="panel-body">
        <formio-submission submission="{_id: {_item: <?= $index ?>, _request: <?= $formRequest->id ?>, _formId: <?= htmlspecialchars(json_encode($item->formId)) ?>, _branchId: <?= htmlspecialchars(json_encode($item->itemValue['branch'])) ?>}, data: <?= htmlspecialchars(json_encode($item->itemValue['submission'])) ?>}" form="<?= htmlspecialchars(json_encode($item->itemValue['form'])) ?>"></formio-submission>
        </div>

      <?php endif; ?>
      </div>
    <?php endforeach; ?>
  </div>
 </div>

<script>
 angular.injector(['ng', 'formioApp']).invoke(['$compile', '$rootScope', '$http', function($compile, $rootScope, $http) {
    const $scope = $rootScope.$new(true);
    $compile(document.getElementById("package-" + <?= json_encode($formRequest->id) ?>))($scope)

    $scope.approve = function (sub) {
        const method = 'PUT'
        $http({
          url: <?= json_encode($submitUrl) ?>,
          data: JSON.stringify(sub),
          method: method,
          headers: {'Content-Type': 'application/json'}
        }).then(function () {
          console.log('success')
        }).catch(function () {
          console.log('fail')
        })
    };

    $scope.$on('formSubmission', function (e, sub) {
      if (sub._id._request === <?= json_encode($formRequest->id) ?>) {
        sub._request = sub._id._request
        sub._item = sub._id._item

        sub.data = {value: sub.data, branchId: sub._id._branchId, formId: sub._id._formId}
        var method = 'PUT';
        $http({
          url: <?= json_encode($submitUrl) ?>,
          data: JSON.stringify(sub),
          method: method,
          headers: {'Content-Type': 'application/json'}
        }).then(function() {
          $scope.$broadcast('submitDone', sub, 'Successfully Submitted!');
        }).catch(function() {
          $scope.$broadcast('submitError', 'Oops, there was a problem submitting.');
        })
      }
    })
 }])
</script>