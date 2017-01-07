<?php

namespace intelligen\modules\pcontent\controllers;

use Yii;

use yii\rest\ActiveController;
use yii\web\UnauthorizedHttpException;
use intelligen\modules\pcontent\models\RestUser;

class RestController extends ActiveController {
    public $modelClass = 'intelligen\modules\pcontent\models\Content';

    public function beforeAction ($action) {
        Yii::$app->request->enableCsrfValidation = false;
        Yii::$app->request->parsers =  [
          'application/json' => 'yii\web\JsonParser',
        ];

        if (!parent::beforeAction($action)) {
            return false;
        }

        $req = Yii::$app->request;
        parse_str($req->queryString);

        if (!isset($access_token)) {
            throw new UnauthorizedHttpException('Access unavailable without access_token.', 401);
        }

        if (RestUser::isAllowed($access_token)) {
            return true;
        } 

        throw new UnauthorizedHttpException('You are requesting with an invalid credential.', 401);
    }
}