<?php

use humhub\modules\space\widgets\Sidebar;
use humhub\modules\space\widgets\Menu;

$events = 'intelligen\modules\egnyte\Events';

return [
    'id' => 'egnyte',
    'class' => 'intelligen\modules\egnyte\Module',
    'namespace' => 'intelligen\modules\egnyte',
    'events' => [
        ['class' => Sidebar::className(), 'event' => Sidebar::EVENT_INIT, 'callback' => [$events, 'onSpaceSidebarInit']],
        ['class' => Menu::className(), 'event' => Menu::EVENT_INIT, 'callback' => [$events, 'onSpaceMenuInit']]
    ],
];
