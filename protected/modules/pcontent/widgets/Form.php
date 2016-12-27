<?php

namespace intelligen\modules\pcontent\widgets;

use Yii;
use intelligen\modules\pcontent\models\UserMetadata;

class Form extends \humhub\modules\post\widgets\Form {
    /**
     * @inheritdoc
     */
    public function renderForm()
    {
        $user = Yii::$app->user;

        return $this->render('form', [
            'space' => $this->contentContainer,
            'user' => $user
        ]);
    }
}