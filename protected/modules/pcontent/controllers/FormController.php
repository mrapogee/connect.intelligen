<?php

namespace intelligen\modules\pcontent\controllers;

use Yii;
use intelligen\modules\pcontent\models\Content;
use humhub\modules\user\models\User;
use humhub\modules\content\models\WallEntry;

function endsWith($haystack, $needle)
        {
            $length = strlen($needle);
            if ($length == 0) {
                return true;
            }

            return (substr($haystack, -$length) === $needle);
        }

class FormController extends RestController {
    public $modelClass = 'intelligen\modules\pcontent\models\Form';

    function actionFormSubmission() {
        $post = Yii::$app->request->post();
        $request = json_decode($post['rawRequest']);

        $user = User::findOne(Yii::$app->params['adminID']);
        Yii::$app->user->switchIdentity($user, 0);

        foreach ($request as $key => $val) {
            if (endsWith($key, 'contentId')) {
                $content = Content::findOne($val);
                $data = json_decode($content->value);
                $data->submission = $post['submissionID'];
                $content->value = json_encode($data);
                $content->save();

                $content->content->addToWallWithTitle('Agent');
            }
        }
    }
}