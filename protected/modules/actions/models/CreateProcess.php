<?php

namespace intelligen\modules\actions\models;

use Yii;
use yii\base\Model;
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
use intelligen\modules\actions\components\WaggleClient;

class CreateProcess extends Model {
    public $spaceName;
    public $processId;
    public $space;

    function rules () {
        return [
            [['processId', 'spaceName'], 'required'],
            [['processId', 'spaceName'], 'string'],
        ];
    }

    function attributeLabels () {
        return [
            'processId' =>  'Process',
            'spaceName' =>  'Space Name'
        ];
    }

    function save () {
      $processId = $this->processId;
      $spaceName = $this->spaceName;
      $instance = WaggleClient::createProcessInstance($processId);

      $space = new Space();
      $space->name = $spaceName;
      $space->join_policy = Space::JOIN_POLICY_NONE;
      $space->visibility = Space::VISIBILITY_NONE;

      if (!$space->validate() || !$space->save()) {
          foreach ($space->getErrors() as $error) {
            $this->addError('spaceName', $error->message);
          }

          return false;
      }

      $this->space = $space;

      $space->enableModule('actions');
      Yii::$app->getModule('actions')->settings
        ->contentContainer($space)->set('instance', $instance->_id);

      return true;
    }
}