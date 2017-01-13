<?php

use intelligen\modules\pcontent\widgets\FormForm;

echo FormForm::widget([
    'contentContainer' => $contentContainer,
    'form' => $form,
    'forms' => $forms,
]);

echo \humhub\modules\content\widgets\Stream::widget(array(
    'contentContainer' => $contentContainer,
    'streamAction' => '/pcontent/content/form-stream',
    'messageStreamEmpty' => Yii::t('PollsModule.widgets_views_stream', '<b>There is no forms yet!</b>'),
));