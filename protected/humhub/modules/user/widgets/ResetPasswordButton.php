<?php

namespace humhub\modules\user\widgets;

use humhub\widgets\Base;

class ResetPasswordButton extends \yii\base\Widget {
    public $user;

    public function run () {
        if (!$this->user->loggedInUserCanResetPassword()) {
            return;
        }

        return $this->render('resetPasswordButton', ['user' => $this->user]);
    }
}