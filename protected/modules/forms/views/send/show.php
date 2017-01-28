<?php

use \intelligen\modules\forms\widgets\FormForm;

echo FormForm::widget([
    'contentContainer' => $contentContainer,
    'forms' => $forms
]);

echo \humhub\modules\content\widgets\Stream::widget(array(
    'contentContainer' => $contentContainer,
    'streamAction' => '/forms/send/stream',
    'messageStreamEmpty' => Yii::t('PollsModule.widgets_views_stream', '<b>There is no forms yet!</b>'),
));