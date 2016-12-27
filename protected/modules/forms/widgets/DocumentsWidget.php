<?php

namespace intelligen\modules\forms\widgets;

use Yii;

class DocumentsWidget extends \yii\base\Widget {
    public function run()
    {
        return $this->render('documentsPanel', []);
    }
}