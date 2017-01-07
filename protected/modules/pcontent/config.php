<?php


use humhub\modules\space\widgets\Sidebar;
use humhub\modules\space\widgets\Menu;

$events = 'intelligen\modules\pcontent\Events';

return [
    'id' => 'pcontent',
    'class' => 'intelligen\modules\pcontent\Module',
    'namespace' => 'intelligen\modules\pcontent',
    'events' => [
        ['class' => Sidebar::className(), 'event' => Sidebar::EVENT_INIT, 'callback' => [$events, 'onSpaceSidebarInit']],
        ['class' => Menu::className(), 'event' => Menu::EVENT_INIT, 'callback' => [$events, 'onSpaceMenuInit']]
    ],
];
