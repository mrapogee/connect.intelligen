<?php

use humhub\modules\space\widgets\Sidebar;

$events = 'intelligen\modules\forms\Events';

return [
    'id' => 'energy.intelligen.forms',
    'class' => 'intelligen\modules\forms\Module',
    'namespace' => 'intelligen\modules\forms',
    'events' => [
        ['class' => Sidebar::className(), 'event' => Sidebar::EVENT_INIT, 'callback' => [$events, 'onSpaceSidebarInit']]
    ],
];
