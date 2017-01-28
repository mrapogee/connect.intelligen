<?php

use humhub\modules\space\widgets\Sidebar;
use humhub\widgets\TopMenu;
use humhub\modules\space\widgets\Menu;

$events = 'intelligen\modules\forms\Events';

return [
    'id' => 'forms',
    'class' => 'intelligen\modules\forms\Module',
    'namespace' => 'intelligen\modules\forms',
    'events' => [
        ['class' => TopMenu::className(), 'event' => TopMenu::EVENT_INIT, 'callback' => [$events, 'onTopMenuInit']],
        ['class' => Menu::className(), 'event' => Menu::EVENT_INIT, 'callback' => [$events, 'onSpaceMenuInit']]
    ],
];
