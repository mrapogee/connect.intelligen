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

class Client extends Model {
    public $firstname;
    public $lastname;
    public $street_address;
    public $city;
    public $state;
    public $country;
    public $postal_code;
    public $email;
    public $phone_number;
    public $agent_email;

    public $notifications = true;
    public $createSpace = true;
    public $space;
    public $clientUser;

    function rules () {
        if ($this->createSpace) {
            return [
                [['firstname', 'lastname', 'street_address', 'city', 'state', 'country', 'postal_code', 'email', 'phone_number', 'agent_email'],
                'string'],
                [['firstname', 'lastname', 'street_address', 'city', 'state', 'country', 'postal_code', 'email'],
                'required'],
                [['agent_email', 'email'], 'email']
            ];
        } else {
            return [
                [['firstname', 'lastname', 'street_address', 'city', 'state', 'country', 'postal_code', 'email', 'phone_number', 'agent_email'],
                'string'],
                [['firstname', 'lastname', 'email'],
                'required'],
                [['agent_email', 'email'], 'email']
            ];
        }
    }

    function attributeLabels () {
        return [
            'firstname' => 'First Name',
            'lastname' => 'Last Name'
        ];
    }

    function createClient () {
        $user = User::findOne(['email' => $this->email]);

        if ($user === null) {
            // Create user
            $user = new User();
            $user->scenario = 'registration_email';
            $user->username = $this->email;
            $user->email = $this->email;

            if (!$user->validate() || !$user->save()) {
                return ['errors' => $user->getErrors()];
            }

            $profile = new Profile();
            $profile->user_id = $user->id;
            $profile->scenario = 'registration';
            $profile->firstname = $this->firstname;
            $profile->lastname = $this->lastname;
            $profile->street = $this->street_address;
            $profile->city = $this->city;
            $profile->state = $this->state;
            $profile->zip = $this->postal_code;
            $profile->country = 'US';
            $profile->mobile = $this->phone_number;

            if (!$profile->validate() || !$profile->save()) {
                return ['errors' => $profile->getErrors()];
            }

            if (!$this->notifications) {
                Yii::$app->getModule('notification')->settings->contentContainer($user)->set('receive_email_notifications', User::RECEIVE_EMAIL_NEVER);
                Yii::$app->getModule('activity')->settings->contentContainer($user)->set('receive_email_activities', User::RECEIVE_EMAIL_NEVER);
            }

            $password = new Password();
            $password->scenario = 'registration';
            $security = new yii\base\Security();
            $passwordStr = $security->generateRandomString(16);
            $password->newPassword = $passwordStr;
            $password->newPasswordConfirm = $passwordStr;
            $password->user_id = $user->id;

            if (!$password->validate() || !$password->save()) {
                return ['errors' => $password->getErrors()];
            }

            $user = User::findOne($user->id);
        }

        if (!$this->createSpace) {
            return $this->finish(null, $user);
        }

        $spaceName = "Client - $this->lastname, $this->street_address";
        $space = Space::findOne(['name' => $spaceName]);

        if ($space === null) {
            // Create Client Space
            $space = new Space();
            $space->name = $spaceName;
            $space->join_policy = Space::JOIN_POLICY_NONE;
            $space->visibility = Space::VISIBILITY_NONE;

            if (!$space->validate() || !$space->save()) {
                return ['errors' => $space->getErrors()];
            }

            $space->addMember($user->id);
            $space->enableModule('pcontent');

            $clientWall = new Wall();
            $clientWall->title = 'Client';
            $clientWall->object_id = $space->id;
            $clientWall->object_model = Space::className();

            if (!$clientWall->validate() || !$clientWall->save()) {
                return ['errors' => $clientWall->getErrors()];
            }

            $wallMember = new WallContentMembership();
            $wallMember->content_container_id = $space->id;
            $wallMember->user_id = $user->id;
            $wallMember->wall_id = $clientWall->id;

            if (!$wallMember->validate() || !$wallMember->save()) {
                return ['errors' => $wallMember->getErrors()];
            }

            $agentWall = new Wall();
            $agentWall->title = 'Agent';
            $agentWall->object_id = $space->id;
            $agentWall->object_model = Space::className();

            if (!$agentWall->validate() || !$agentWall->save()) {
                return ['errors' => $agentWall->getErrors()];
            }

            $agent = isset($this->agent_email) 
                ? User::findOne(['email' => $this->agent_email])
                : Yii::$app->user->getIdentity();

            if ($agent) {
                $space->addMember($agent->id);

                $agentWallMember = new WallContentMembership();
                $agentWallMember->content_container_id = $space->id;
                $agentWallMember->wall_id = $agentWall->id;
                $agentWallMember->user_id = $agent->id;

                if (!$agentWallMember->validate() || !$agentWallMember->save()) {
                    return ['errors' => $agentWallMember->getErrors()];
                }
            }
        }

        return $this->finish($space, $user);
    }

    private function finish ($space, $clientUser) {
        $this->space = $space;
        $this->clientUser = $clientUser;
        if ($space != null && $clientUser != null) {
            $this->clientUser->profile->client_space = (string) $space->id;
            $this->clientUser->profile->update();
        }

        return ['success' => true, 'errors' => []];
    }
}