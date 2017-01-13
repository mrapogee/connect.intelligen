<?php

use intelligen\modules\pcontent\widgets\ActivityForm;

echo ActivityForm::widget([
    'contentContainer' => $contentContainer,
    'activity' => $activity,
    'activityType' => $activityType
]);

echo \humhub\modules\content\widgets\Stream::widget(array(
    'contentContainer' => $contentContainer,
    'streamAction' => '/pcontent/content/activity-stream',
    'messageStreamEmpty' => Yii::t('PollsModule.widgets_views_stream', '<b>There is no activity yet!</b>'),
));