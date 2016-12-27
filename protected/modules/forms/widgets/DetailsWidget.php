<?php

namespace intelligen\modules\forms\widgets;

use Yii;

class DetailsWidget extends \yii\base\Widget {
    public function run()
    {
        return $this->render('detailsPanel', []);
    }
}