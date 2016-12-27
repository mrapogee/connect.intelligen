<?php

use yii\helpers\Html;

?>
<div class="PSpaceForm">

<div class="message">
    <?php 
    echo Html::textArea(
        "message", 
        '', 
        [
            'id' => 'contentForm_message', 
            'class' => 'form-control autosize contentForm', 
            'rows' => '1', 
            'placeholder' => 'Send a message.'
        ]
    ); 

    echo \humhub\widgets\RichTextEditor::widget(array(
        'id' => 'contentForm_message',
    ));
    ?>
</div>

<?php ?>
    <div class="btn-group activity">
        <button class="btn btn-default" title="Send Email">
            <i class="fa fa-envelope"></i>
        </button>
        <a href="<?= $space->createUrl('/pcontent/content/log-activity', ['activity_type' => 'phone']) ?>" class="btn btn-default" title="Log Call">
            <i class="fa fa-phone"></i>
        </a>
        <a href="<?= $space->createUrl('/pcontent/content/log-activity', ['activity_type' => 'meeting']) ?>" class="btn btn-default" title="Log Meeting">
            <i class="fa fa-users"></i>
        </a>
        <a href="<?= $space->createUrl('/pcontent/content/log-activity', ['activity_type' => 'sms']) ?>" class="btn btn-default" title="Log SMS">
            SMS
        </a>
    </div>
<?php ?>


</div>


