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
        $elevated = $user->getIdentity()->getGroups()->where(['name' => 'Elevated'])->count() > 0;

        return $this->render('form', [
            'space' => $this->contentContainer,
            'user' => $user,
            'elevated' => $elevated,
        ]);
    }
}