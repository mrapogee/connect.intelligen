<?php
use \yii\helpers\Html;

\intelligen\modules\forms\assets\Builder::register($this);
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

  .form-type-select {
    display: inline-block;
    width: 100px;
    height: 28px;
    vertical-align: top;
  }

  .form-builder-form-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-builder-form {
    margin: 0 -10px;
  }
  .form-builder-form > .form-group {
    display: inline-block;
    min-width: 200px;
    padding: 10px;
  }

  .form-builder-select-form {
    display: flex;
    margin: 0 -10px;
  }

  .form-builder-select-form > * {
    flex-grow: 1;
    padding: 10px;
  }
 </style>

<div ng-app="formBuilder" class="ng-scope">

  <div class="form-builder-select-form">
    <div class="form-group field-client">
      <label class="control-label" for="forms">Forms</label>
      <select class="form-control" id="forms" ng-model="selectedForm">
        <option default></option>
        <?php foreach ($forms as $formOption): ?>
          <option value=<?= $formOption->_id ?>><?= Html::encode($formOption->name) ?></option>
        <?php endforeach; ?>
      </select>
    </div>

    <div class="form-group field-client">
      <label class="control-label" for="branch">Version</label>
      <select class="form-control" ng-model="selectedBranch" id="branch">
        <?php foreach ($form->branches as $branchId => $branchOption): ?>
          <option value=<?= $branchId ?>><?= Html::encode($branchOption['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
  </div>

  <div class="form-builder-form-container">

    <div class="form-builder-form">
      <div class="form-group field-client">
        <label class="control-label" for="name">Name</label>
        <input class="form-control" id="name" ng-model="details.formName" type="text"/>
      </div>

      <div class="form-group field-client">
        <label class="control-label" for="name">Version Name</label>
        <input class="form-control" id="name" ng-model="details.branchName" type="text"/>
      </div>

      <div class="form-group field-client">
        <label class="control-label" for="name">Display As</label>
        <select class="form-control" ng-model="form.display" ng-options="display.name as display.title for display in displays"></select>
      </div>
    </div>

    <div class="buttons">
      <button ng-click="save()" ng-disabled="saved" class="btn btn-primary" title="Save Form">Save</button>
      <button ng-click="publish()" class="btn" title="Publish Form">Publish</button>
    </div>
  </div>

  <div class="well" style="background-color: #fdfdfd;">
      <form-builder form="form"></form-builder>
  </div>
</div>
<!-- <formio form="form" ng-if="renderForm"></formio> -->

<script src="https://cdn.ckeditor.com/4.5.11/standard/ckeditor.js"></script>
<script src="https://unpkg.com/signature_pad@1.5.3/signature_pad.min.js"></script>
<script>
  window.loadedForm = <?= json_encode($form ? $form->getAttributes($form->attributes()) : null) ?>;
  window.loadedBranchId = <?= json_encode($branch) ?>;
  window.loadedBranch = loadedForm.branches[loadedBranchId];
  window.builderSaveUrl = <?= json_encode($saveUrl) ?>;

  // Due to php json_encode outputing object id as {$oid: id}
  if (loadedForm._id) {
    loadedForm._id = loadedForm._id.$oid
    loadedForm.id = loadedForm._id.$oid
  }
</script>

