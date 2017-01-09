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

class ManageSpaces {
    public static function getRules () {
        return [
            [['name', 'address', 'email', 'phone_number', 'intelligen_professional'], 'required'],
            [['name', 'address', 'email', 'phone_number', 'intelligen_professional'], 'string'],
            [['email', 'intelligen_professional'], 'email']
        ];
    }

    public static function createClient ($data) {
        $user = User::findOne(['email' => $data['email']]);
        
        if ($user === null) {
            // Create user
            $user = new User();
            $user->scenario = 'registration_email';
            $user->username = $data['email'];
            $user->email = $data['email'];

            if (!$user->validate() || !$user->save()) {
                return ['errors' => $user->getErrors()];
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

            $profile = new Profile();
            $profile->scenario = 'registration';
            $profile->firstname = $data['firstname'];
            $profile->lastname = $data['lastname'];
            $profile->user_id = $user->id;

            if (!$profile->validate() || !$profile->save()) {
                return ['errors' => $profile->getErrors()];
            }
        }

        $address = $data['address'];
        $spaceName = "Client - $data[lastname], $address[street_number] $address[street_name]";
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

            $agent = User::findOne(['email' => $data['agent_email']]);
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

        return ['success' => true, 'errors' => []];
    }
}
