<?php

namespace intelligen\modules\forms;

use Yii;
use yii\helpers\Url;
use intelligen\modules\forms\widgets\FormsWidget;
use intelligen\modules\forms\widgets\DocumentsWidget;
use intelligen\modules\forms\widgets\DetailsWidget;

class Events extends \yii\base\Object {
    public static function onSpaceMenuInit ($event)
    {
        $menu = $event->sender;
        $space = $event->sender->space;
        $user = Yii::$app->user->getIdentity();

        if ($user->isElevated() && $space->isModuleEnabled('forms')) {
            $menu->addItem([
                'label' => 'Forms',
                'group' => 'modules',
                'url' => $space->createUrl('/forms/send'),
                'icon' => '<i class="fa fa-database"></i>',
                'isActive' => Yii::$app->controller->action->actionMethod === 'send' && Yii::$app->controller->module->id === 'forms',
            ]);
        }
    }

    public static function onTopMenuInit($event)
    {
        if (Yii::$app->user->isGuest) {
            return;
        }

        $event->sender->addItem(array(
            'label' => 'Form Builder',
            'url' => Url::to(['/forms/builder']),
            'icon' => '<i class="fa fa-list-alt"></i>',
            'isActive' => (Yii::$app->controller->module && Yii::$app->controller->module->id == 'forms'),
            'sortOrder' => 800,
        ));
    }
}