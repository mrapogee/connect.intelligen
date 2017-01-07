<?php

namespace intelligen\modules\pcontent;

use Yii;
use intelligen\modules\forms\widgets\FormsWidget;
use intelligen\modules\forms\widgets\DocumentsWidget;
use intelligen\modules\forms\widgets\DetailsWidget;

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

        if ($user->getGroups()->where(['name' => 'Elevated'])->count() > 0) {
            $menu->addItem([
                'label' => 'Activity',
                'group' => 'modules',
                'url' => $space->createUrl('/pcontent/content/log-activity'),
                'icon' => '<i class="fa fa-fire"></i>',
                'isActive' => ( Yii::$app->controller->action->actionMethod === 'actionLogActivity' and Yii::$app->controller->module->id === 'pcontent'),
            ]);

            $menu->addItem([
                'label' => 'Forms',
                'group' => 'modules',
                'url' => $space->createUrl('/pcontent/content/log-forms'),
                'icon' => '<i class="fa fa-database"></i>',
                'isActive' => ( Yii::$app->controller->action->actionMethod === 'actionLogForms' and Yii::$app->controller->module->id === 'pcontent'),
            ]);
        }
    }
}