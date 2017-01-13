<?php

namespace intelligen\modules\egnyte;

use Yii;
use intelligen\modules\egnyte\controllers\FoldersController;

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

        if ($space->isModuleEnabled('egnyte')) {
            $menu->addItem([
                'label' => 'Folders',
                'group' => 'modules',
                'url' => $space->createUrl('/egnyte/folders/index'),
                'icon' => '<i class="fa fa-folder"></i>',
                'isActive' => ( Yii::$app->controller->action->controller instanceof FoldersController )
            ]);
        }
    }
}