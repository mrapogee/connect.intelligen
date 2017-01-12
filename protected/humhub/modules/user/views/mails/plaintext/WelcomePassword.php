<?php

use yii\helpers\Html;

?>

You've been invited to Intelligen Connect!

<?php echo strip_tags(Yii::t('UserModule.views_mails_RecoverPassword', 'Hello {displayName}', array('{displayName}' => Html::encode($user->displayName)))); ?>


Please use the following link within the next day to setup your password.

<?php echo strip_tags(Yii::t('UserModule.views_mails_RecoverPassword', "If you don't use this link within 24 hours, it will expire.")); ?>


Setup Password: <?php echo urldecode($linkPasswordReset); ?>
