<?php

namespace intelligen\modules\pcontent\components;

use Yii;
use humhub\modules\user\models\User;
use humhub\modules\user\models\Password;
use humhub\modules\user\models\Profile;
use humhub\modules\user\models\forms\Registration;
use humhub\modules\space\models\Space;
use humhub\modules\space\models\Membership;
use humhub\modules\content\models\Wall;
use intelligen\modules\pcontent\models\WallContentMembership;
use yii\base\DynamicModel;
use intelligen\modules\pcontent\components\JotClient;
use intelligen\modules\pcontent\components\ManageSpaces;

class CreateClientAction extends \yii\base\Action {
    public static function getRules () {
        return [
            [['name', 'address', 'email', 'phone_number', 'intelligen_professional'], 'required'],
            [['name', 'address', 'email', 'phone_number', 'intelligen_professional'], 'string'],
            [['email', 'intelligen_professional'], 'email']
        ];
    }

    public function run () {
        $admin = User::findOne(Yii::$app->params['adminID']);
        Yii::$app->user->switchIdentity($admin, 0);

        // Get user data
        $response = Yii::$app->getResponse();
        $rawData = Yii::$app->getRequest()->getBodyParams();

        $model = DynamicModel::validateData($rawData, self::getRules());

        if ($model->hasErrors()) {
            $response->setStatusCode(400);
            return ['errors' => $model->getErrors()];
        }

        $data = [];

        $names = preg_split("/[\s]+/", $rawData['name']);
        if (count($names) === 1) {
            $data['firstname'] = ' ';
            $data['lastname'] =  $names[0];
        } else {
            $data['firstname'] = array_shift($names);
            $data['lastname'] = implode(' ', $names);
        }

        $data['address'] = JotClient::parseAddress($rawData['address']);
        $data['email'] = $rawData['email'];
        $data['agent_email'] = $rawData['intelligen_professional'];
        $data['phone_number'] = $rawData['phone_number'];

        $result = ManageSpaces::createClient($data);

        if (!isset($result['success']) || !$result['success']) {
            $response->setStatusCode(500);
        } else {
            $response->setStatusCode(201);
        }

        return $result;
    }
}