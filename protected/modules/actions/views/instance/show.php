<?php
use yii\helpers\Html;
use yii\helpers\Url;
?>

    <h2>Steps</h2>
    <br>
    <table class="table table-hover">
          <thead>
              <th><strong>Step</strong></th>
              <th><strong>Done</strong></th>
              <th><strong>Actions</strong></th>
          </thead>
          <tbody>
          <?php $done = true; ?>
          <?php foreach ($steps as $index => $step): ?>
          <?php if (isset($instance->currentStep) && $index === $instance->currentStep) { $done = false; } ?>
              <tr>
                  <td>
                  <h4><strong><?= Html::encode($step->name) ?></strong></h4>
                  </td>
                  <td>
                    <i class="fa fa-<?= $done ? 'check-circle' : '' ?>"></i>
                  </td>
                  <td>
                  </td>
              </tr>
          <?php endforeach; ?>
          </tbody>
      </table>

<br>
<form action="<?= $contentContainer->createUrl('/actions/instance') ?>" method="POST">
    <input type="hidden" name="_csrf" value="<?=Yii::$app->request->getCsrfToken()?>" />
    <button type="submit" name="updateProcess" class="btn btn-primary">Update Process</button>
</form>

<br>
<form action="<?= $contentContainer->createUrl('/actions/instance') ?>" method="POST">
  <input type="hidden" name="_csrf" value="<?=Yii::$app->request->getCsrfToken()?>" />
  <h2>Roles</h2>
  <br>
  <?php foreach ($roles as $role): ?>
  <?php $role_id = $role->id; ?>
  <?php $value = $values->$role_id->members ?>
  <div style="margin-bottom: 30px">
    <h4 for=<?= json_encode($role_id) ?>><?= Html::encode(yii\helpers\Inflector::pluralize($role->name)) ?></h4>
    <?= Html::textInput("roles[$role_id]", implode(',', $value), ['placeholder' => '', 'id' => $role_id]); ?>
    <?php
    // attach mention widget to it
    echo humhub\modules\user\widgets\UserPicker::widget(array(
        'inputId' => $role_id,
        'placeholderText' => 'Select users in role',
        'value' => implode(',', $value)
    ));
    ?>
  </div>
  <?php endforeach; ?>

  <button type="submit" name="saveRoles" class="btn btn-primary">Save</button>
</form>