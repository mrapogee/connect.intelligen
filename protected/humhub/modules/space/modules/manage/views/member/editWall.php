<?php

use yii\helpers\Html;
use humhub\modules\space\modules\manage\widgets\MemberMenu;
use yii\widgets\ActiveForm;
use humhub\modules\space\models\Space;

?>


<div class="panel panel-default panel-space-edit-walls">
    <div class="panel-heading">
        <?php echo Yii::t('SpaceModule.views_admin_members', '<strong>Manage</strong> members'); ?>
    </div>
    <?= MemberMenu::widget(['space' => $space]); ?>
    <div class="panel-body">
        <div class='header'>
            <h4>Edit Wall</h4>
        </div>       
        <br>
        <?php $form = ActiveForm::begin([
            'action' => $space->createUrl('member/edit-wall'),
            'method' => 'POST'
        ]); ?>

        <?= $form->field($wall, 'id')->hiddenInput()->label(false) ?>
        <?= $form->field($wall, 'object_model')->hiddenInput(['value' => Space::classname()])->label(false) ?>
        <?= $form->field($wall, 'object_id')->hiddenInput(['value' => $space->id])->label(false) ?>
        <?= $form->field($wall, 'title')->textInput() ?>

        <?= Html::submitButton('Save Wall', ['class' => 'btn btn-primary', 'name' => 'wallSubmit']) ?>

        <?php ActiveForm::end(); ?>
    </div>
</div>
