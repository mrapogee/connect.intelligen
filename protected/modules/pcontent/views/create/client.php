<?php
use humhub\widgets\ActiveForm;
use yii\helpers\Url;
?>
<div class="modal-dialog modal-dialog-small animated fadeIn">
    <div class="modal-content">
        <?php $form = ActiveForm::begin(); ?>
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title" id="myModalLabel"><strong>Create</strong> new client</h4>
        </div>

        <div class="modal-body">
            <hr>
            <br>
            <?= $form->field($client, 'firstname')->input(['placeholder' => '']); ?>
            <?= $form->field($client, 'lastname')->input(['placeholder' => '']); ?>
            <?= $form->field($client, 'email')->input(['placeholder' => '']); ?>
            <?= $form->field($client, 'phone_number')->input(['placeholder' => '']); ?>
            <?= $form->field($client, 'street_address')->input(['placeholder' => '']); ?>
            <?= $form->field($client, 'postal_code')->input(['placeholder' => '']); ?>
            <?= $form->field($client, 'city')->input(['placeholder' => '']); ?>
            <?= $form->field($client, 'state')->input(['placeholder' => '']); ?>
            <?= $form->field($client, 'country')->input(['placeholder' => '']); ?>
        </div>

        <div class="modal-footer">
            <hr>
            <br>
            <?php
            echo \humhub\widgets\AjaxButton::widget([
                'label' => 'Create',
                'ajaxOptions' => [
                    'type' => 'POST',
                    'beforeSend' => new yii\web\JsExpression('function(){ setModalLoader(); }'),
                    'success' => new yii\web\JsExpression('function(html){ $("#globalModal").html(html); }'),
                    'url' => Url::to(['/pcontent/create/create-client']),
                ],
                'htmlOptions' => [
                    'class' => 'btn btn-primary',
                    'id' => 'client-create-submit-button',
                ]
            ]);
            ?>

            <?php echo \humhub\widgets\LoaderWidget::widget(['id' => 'create-loader', 'cssClass' => 'loader-modal hidden']); ?>
        </div>

        <?php ActiveForm::end(); ?>
    </div>

</div>


<script type="text/javascript">

    // Replace the standard checkbox and radio buttons
    $('.modal-dialog').find(':checkbox, :radio').flatelements();

    // show Tooltips on elements inside the views, which have the class 'tt'
    $('.tt').tooltip({html: false});

    // Shake modal after wrong validation
    <?php if ($client->hasErrors()) { ?>
            $('.modal-dialog').removeClass('fadeIn');
            $('.modal-dialog').addClass('shake');
    <?php } ?>

    // prevent enter key and simulate ajax button submit click
    $(document).ready(function () {
        $(window).keydown(function (event) {
            if (event.keyCode == 13) {
                event.preventDefault();
                $('#client-create-submit-button').click();
                //return false;
            }
        });

        $('#client-firstname').focus();
    });

</script>
