<?php

namespace intelligen\modules\pcontent;

use Yii;
use intelligen\modules\pcontent\controllers\BiddersController;

class Events extends \yii\base\Object {
    public static function onSpaceSidebarInit ($event)
    {
        $space = $event->sender->space;
    }

    public static function onSpaceMenuInit ($event)
    {
        $menu = $event->sender;
        $space = $menu->space;

        $user = Yii::$app->user->getIdentity();

        if ($user->isElevated() && $space->isModuleEnabled('pcontent')) {
            $menu->addItem([
                'label' => 'Activity',
                'group' => 'modules',
                'url' => $space->createUrl('/pcontent/content/log-activity'),
                'icon' => '<i class="fa fa-fire"></i>',
                'isActive' => ( Yii::$app->controller->action->actionMethod === 'actionLogActivity' and Yii::$app->controller->module->id === 'pcontent'),
            ]);

            $menu->addItem([
                'label' => 'Bidders',
                'group' => 'modules',
                'url' => $space->createUrl('/pcontent/bidders/show'),
                'icon' => '<i class="fa fa-users"></i>',
                'isActive' => ( Yii::$app->controller->action->controller instanceof BiddersController ),
            ]);
        }
    }
}