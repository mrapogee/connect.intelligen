<?php

use yii\helpers\Html;

?>

<div class="panel panel-default">
    <div class="message panel-body">
        <form method="POST" action="<?= $activity->content->container->createUrl('/pcontent/content/log-activity') ?>">
        <input type="hidden" name="_csrf" value="<?=Yii::$app->request->getCsrfToken()?>">

        <?php 
        echo Html::radioList(
            "activity_type", 
            $activityType, 
            [
                'phone' => 'Phone',
                'message' => 'Message',
                'meeting' => 'Meeting',
            ],
            [
                'id' => 'contentForm_activity', 
                'class' => 'contentForm', 
            ]
        );

        echo '<br>';

        echo Html::textArea(
            "message", 
            '', 
            [
                'id' => 'contentForm_message', 
                'class' => 'form-control contentForm', 
                'rows' => '4', 
                'placeholder' => 'Notes'
            ]
        ); 

        echo '<br>';

    /* echo yii\jui\DatePicker::widget([
            'dateFormat' => Yii::$app->params['formatter']['defaultDateFormat'], 
            'clientOptions' => [], 
            'options' => [
                'name' => 'date',
                'class' => 'form-control', 
                'placeholder' => 'Date'
            ]
        ]); */

        echo \humhub\widgets\RichTextEditor::widget(array(
            'id' => 'contentForm_message',
        ));

        echo Html::submitButton('Log', ['class' => 'btn btn-primary']);

        ?>
        </form>
    </div>
</div>


<?=
    \humhub\modules\content\widgets\Stream::widget([
        'contentContainer' => $contentContainer,
        'streamAction' => '//pcontent/content/activity-stream',
        'messageStreamEmpty' => 'There is no activity yet!',
        'filters' => []
    ])
?>
