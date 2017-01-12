<?php

namespace intelligen\modules\pcontent\models; 

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

class CreateExistingClient extends Model {
    public $selected_user;
    public $user;
    public $client;

    function rules () {
        return [
            ['selected_user', 'required'],
            ['selected_user', 'string'],
            ['selected_user', 'doesNotHaveClient'],
        ];
    }

    static function getPhone ($profile) {
       $potens = ['phone_work', 'phone_private', 'mobile']; 

       foreach ($potens as $option) {
           if (isset($profile->$option)) {
               return $option;
           }
       }

       return null;
    }

    function doesNotHaveClient ($attribute) {
        $userGuid = explode(",", $this->$attribute)[0];
        $userGuid = preg_replace("/[^A-Za-z0-9\-]/", '', $userGuid);

        $user = User::findOne(['guid' => $userGuid]);
        if ($user->profile->client_space != null) {
            $space = Space::findOne($user->profile->client_space);
            if ($space != null) {
                $this->addError($attribute, 'User already has a client space');
                return;
            }
        }

        $this->user = $user;
    }

    function attributeLabels () {
        return [
            'selected_user' =>  'Select Profile'
        ];
    }

    function save () {
        $client = new Client();
        $user = $this->user;

        $client->firstname = $user->profile->firstname;
        $client->lastname = $user->profile->lastname;
        $client->street_address = $user->profile->street;
        $client->city = $user->profile->city;
        $client->state = $user->profile->state;
        $client->postal_code = $user->profile->zip;
        $client->country = $user->profile->country;
        $client->email = $user->email;
        $client->phone_number = self::getPhone($user->profile);

        if ($client->validate()) {
            $result = $client->createClient();
            if (isset($result['success']) && $result['success']) {
                $this->client = $client;
                return true;
            } else {
                return false;
            }
        }    

        foreach ($client->getErrors() as $errors) {
            foreach ($errors as $error) {
                $this->addError('selected_user', $error);
            }
        }
    }
}