<?php

use yii\helpers\Html;

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


echo \humhub\widgets\RichTextEditor::widget(array(
    'id' => 'contentForm_message',
));
