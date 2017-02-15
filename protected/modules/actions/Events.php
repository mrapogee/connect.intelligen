<?php

namespace intelligen\modules\actions;

use Yii;
use yii\helpers\Url;
use intelligen\modules\forms\models\FormRequest;

class Events extends \yii\base\Object {
    public static function onSpaceMenuInit ($event)
    {
        $menu = $event->sender;
        $space = $event->sender->space;
        $user = Yii::$app->user->getIdentity();

        if ($user->isElevated() && $space->isModuleEnabled('actions')) {
            $menu->addItem([
                'label' => 'Process',
                'group' => 'modules',
                'url' => $space->createUrl('/actions/instance'),
                'icon' => '<i class="fa fa-list"></i>',
                'isActive' =>  (Yii::$app->controller->module && Yii::$app->controller->module->id == 'actions' && Yii::$app->controller->id == 'instance')
            ]);
        }
    }

    public static function onTopMenuInit($event)
    {
        if (Yii::$app->user->isGuest) {
            return;
        }

        $user = Yii::$app->user;
        if ($user->isAdmin()) {
            $event->sender->addItem(array(
                'label' => 'Processes',
                'url' => Url::to(['/actions/builder']),
                'icon' => '<i class="fa fa-arrow-right"></i>',
                'isActive' => (Yii::$app->controller->module && Yii::$app->controller->module->id == 'actions' && Yii::$app->controller->id == 'builder'),
                'sortOrder' => 800,
            ));
        }
    }
}