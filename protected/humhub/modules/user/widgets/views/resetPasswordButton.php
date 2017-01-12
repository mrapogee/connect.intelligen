<?php

use yii\helpers\Html;
use yii\helpers\Url;

print Html::a(Yii::t("UserModule.widgets_views_profileEditButton", "Reset Password"), Url::toRoute("/user/password-recovery/welcome-reset?guid=$user->guid"), array('class' => 'btn btn-primary reset-password'));
