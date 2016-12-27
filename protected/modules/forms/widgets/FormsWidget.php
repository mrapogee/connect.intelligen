<?php

namespace intelligen\modules\forms\widgets;

use Yii;

class FormsWidget extends \yii\base\Widget {
    public function run()
    {
        return $this->render('formsPanel', []);
    }
}