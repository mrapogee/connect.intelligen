<?php

namespace intelligen\modules\pcontent\widgets;

use Yii;

class WallCreateContentForm extends \humhub\modules\content\widgets\WallCreateContentForm {
    public $submitUrl = '/pcontent/content/create';

    public function renderForm()
    {

        return $this->render('form', [
        ]);
    }
}
