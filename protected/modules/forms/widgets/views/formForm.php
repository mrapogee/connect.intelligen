<?php

use yii\helpers\Html;

?>

<?php 
echo Html::dropDownList(
    'form',
    '',
    $forms
);

echo '<br>';
echo '<br>';

echo Html::textArea(
    'notes', 
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
?>
        