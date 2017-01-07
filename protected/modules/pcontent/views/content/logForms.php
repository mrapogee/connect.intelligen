<?php

use yii\helpers\Html;

?>

<div class="panel panel-default">
    <div class="message panel-body">
        <form method="POST" action="<?= $form->content->container->createUrl('/pcontent/content/log-forms') ?>">
            <input type="hidden" name="_csrf" value="<?=Yii::$app->request->getCsrfToken()?>">

            <?php 
            echo Html::dropDownList(
                'form',
                '',
                $forms
            );

            echo '<br>';
            echo '<br>';

            echo Html::checkboxList(
                'groups',
                '',
                $walls
            );

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

            echo '<br>';

            echo \humhub\widgets\RichTextEditor::widget(array(
                'id' => 'contentForm_message',
            ));

            echo Html::submitButton('Send', ['class' => 'btn btn-primary']);

            ?>
        </form>
    </div>
</div>

<?=
    \humhub\modules\content\widgets\Stream::widget([
        'contentContainer' => $contentContainer,
        'streamAction' => '//pcontent/content/form-stream',
        'messageStreamEmpty' => 'There is no activity yet!',
        'filters' => []
    ])
?>
