<?php

use humhub\modules\space\widgets\Sidebar;
use humhub\widgets\TopMenu;
use humhub\modules\space\widgets\Menu;

$events = 'intelligen\modules\actions\Events';

return [
    'id' => 'actions',
    'class' => 'intelligen\modules\actions\Module',
    'namespace' => 'intelligen\modules\actions',
    'events' => [
        ['class' => TopMenu::className(), 'event' => TopMenu::EVENT_INIT, 'callback' => [$events, 'onTopMenuInit']],
        ['class' => Menu::className(), 'event' => Menu::EVENT_INIT, 'callback' => [$events, 'onSpaceMenuInit']]
    ],
];
