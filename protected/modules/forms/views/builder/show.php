<?php
use \yii\helpers\Html;

\intelligen\modules\forms\assets\Builder::register($this);
$formData = $form ? $form->getAttributes($form->attributes()) : null;

if ($formData) {
  $formData['_id'] = (string) $form->_id;
}
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
    font-size: 1em;
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
    flex: 1;
    padding: 10px;
  }

  
  .input-group-btn > .btn {
    padding: 6px 12px;
  }
 </style>

<div ng-app="formBuilder" class="ng-scope" id="formBuilder">
  <div class="form-builder-select-form">
    <div class="form-group field-client">
      <label class="control-label" for="forms">Forms</label>
      <div class="input-group">
        <select class="form-control" id="forms" ng-model="selectedForm">
          <?php foreach ($forms as $formOption): ?>
            <option value=<?= $formOption->_id ?>><?= Html::encode($formOption->name) ?></option>
          <?php endforeach; ?>
          <option default value="new"> New...</option>
        </select>
        <span class="input-group-btn">
          <button ng-click="deleteThisForm()" class="btn btn-danger" type="button">
            <i class="fa fa-times"></i>
          </button>
        </span>
      </div>
    </div>
    <?php if ($form): ?>
    <div class="form-group field-client">
      <label class="control-label" for="branch">Version</label>
      <div class="input-group">
        <select class="form-control" ng-model="selectedBranch" id="branch">
          <?php foreach ($form->branches as $branchOption): ?>
            <option value=<?= $branchOption['id'] ?>><?= Html::encode($branchOption['name']) ?></option>
          <?php endforeach; ?>
          <option default value="new"> New...</option>
        </select>
        <span class="input-group-btn">
          <button ng-click="deleteThisBranch()" class="btn btn-danger" type="button">
            <i class="fa fa-times"></i>
          </button>
        </span>
      </div>
    </div>
    <?php endif; ?>
  </div>

  <div ng-if="!form" class="alert alert-info">
    Select or create a form to get started!
  </div>

  <div ng-if="form">
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
        <button ng-click="publish()" ng-disabled="isPublished()" class="btn" title="Publish Form">Publish</button>
      </div>
    </div>

    <div class="well" style="background-color: #fdfdfd;">
        <form-builder ng-if="form" form="form"></form-builder>
      
    </div>
  </div>
</div>
<!-- <formio form="form" ng-if="renderForm"></formio> -->

<script src="https://cdn.ckeditor.com/4.5.11/standard/ckeditor.js"></script>
<script src="https://unpkg.com/signature_pad@1.5.3/signature_pad.min.js"></script>
<script>
  window.loadedForm = <?= json_encode($formData ? $formData : null) ?>;
  window.loadedBranchId = <?= json_encode($branch ? $branch : null) ?>;
  if (loadedForm) {
    window.loadedBranch = loadedForm.branches.find(function (branch) { return branch['id'] == loadedBranchId; });
  }
  window.builderSaveUrl = <?= json_encode($saveUrl) ?>;
</script>

