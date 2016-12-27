<?php

namespace intelligen\modules\forms;

use Yii;
use intelligen\modules\forms\widgets\FormsWidget;
use intelligen\modules\forms\widgets\DocumentsWidget;
use intelligen\modules\forms\widgets\DetailsWidget;

class Events extends \yii\base\Object {
    public static function onSpaceSidebarInit ($event)
    {
        $space = $event->sender->space;

        if (strpos($space->tags, 'solar installation') !== false) {
            $event->sender->addWidget(DetailsWidget::className(), [], ['sortOrder' => '0']);
            $event->sender->addWidget(FormsWidget::className(), [], ['sortOrder' => '200']);
            $event->sender->addWidget(DocumentsWidget::className(), [], ['sortOrder' => '200']);
        }
    }
}