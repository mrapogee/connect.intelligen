<?php
use humhub\widgets\ActiveForm;
use yii\helpers\Url;
use yii\helpers\Html;
?>
<div class="modal-dialog modal-dialog-small animated fadeIn">
    <div class="modal-content">
      <?php $form = ActiveForm::begin(); ?>
      <div class="modal-body">
        <?= $form->field($model, 'processId')->dropDownList(['options' => $processes]) ?>
        <?= $form->field($model, 'spaceName')->textInput([]) ?>
      </div>
      <div class="modal-footer">
        <hr>
        <?php
            echo \humhub\widgets\AjaxButton::widget([
                'label' => 'Create',
                'ajaxOptions' => [
                    'type' => 'POST',
                    'beforeSend' => new yii\web\JsExpression('function(){ setModalLoader(); }'),
                    'success' => new yii\web\JsExpression('function(html){ $("#globalModal").html(html); }'),
                    'url' => Url::to(['/actions/create/create']),
                ],
                'htmlOptions' => [
                    'class' => 'btn btn-primary',
                    'id' => 'client-create-submit-button',
                ]
            ]);
        ?>
      </div>
        <?php ActiveForm::end(); ?>
    </div>
</div>


<script type="text/javascript">
</script>