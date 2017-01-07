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

class CreateClientAction extends \yii\base\Action {
    public static function makeClient (User $user) {

    }

    public function getData () {
        $data = Yii::$app->request->post();

        return $data;
    }

    public function run () {
        // Get user data
        $data = $this->getData();
        $response = Yii::$app->getResponse();
        
        $admin = User::findOne(Yii::$app->params['adminID']);
        Yii::$app->user->switchIdentity($admin, 0);

        $user = User::findOne(['email' => $data['email']]);

        if ($user === null) {
            // Create user
            $user = new User();
            $user->scenario = 'registration_email';
            $user->username = $data['email'];
            $user->email = $data['email'];

            if (!$user->validate() || !$user->save()) {
                $response->setStatusCode(400);
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
                $response->setStatusCode(400);
                return ['errors' => $password->getErrors()];
            }

            $profile = new Profile();
            $profile->scenario = 'registration';
            $profile->firstname = $data['firstname'];
            $profile->lastname = $data['lastname'];
            $profile->user_id = $user->id;

            if (!$profile->validate() || !$profile->save()) {
                $response->setStatusCode(400);
                return ['errors' => $profile->getErrors()];
            }
        }

        
        $spaceName = "Client - $data[lastname] $data[address][street]";
        $space = Space::findOne(['title' => $spaceName]);

        if ($space === null) {
            // Create Client Space
            $space = new Space();
            $space->name = $spaceName;
            $space->join_policy = Space::JOIN_POLICY_NONE;
            $space->visibility = Space::VISIBILITY_NONE;

            if (!$space->validate() || !$space->save()) {
                $response->setStatusCode(400);
                return ['errors' => $space->getErrors()];
            }

            /*$clientMember = new Membership();
            $clientMember->space_id = $space->id;
            $clientMember->user_id = $user->id;
            $clientMember->status = Membership::STATUS_MEMBER;

            if ($clientMember->validate() && $clientMember->save()) {
                $response->setStatusCode(400);
                return ['errors' => $clientMember->getErrors()];
            }*/
            $space->addMember($user->id);

            $clientWall = new Wall();
            $clientWall->title = 'Client';
            $clientWall->object_id = $space->id;
            $clientWall->object_model = Space::className();

            if (!$clientWall->validate() || !$clientWall->save()) {
                $response->setStatusCode(400);
                return ['errors' => $clientWall->getErrors()];
            }

            $wallMember = new WallContentMembership();
            $wallMember->content_container_id = $space->id;
            $wallMember->user_id = $user->id;
            $wallMember->wall_id = $clientWall->id;

            if (!$wallMember->validate() || !$wallMember->save()) {
                $response->setStatusCode(400);
                return ['errors' => $wallMember->getErrors()];
            }

            $agentWall = new Wall();
            $agentWall->title = 'Agent';
            $agentWall->object_id = $space->id;
            $agentWall->object_model = Space::className();

            if (!$agentWall->validate() || !$agentWall->save()) {
                $response->setStatusCode(400);
                return ['errors' => $agentWall->getErrors()];
            }

            $agent = User::findOne(['email' => $data['agent_email']]);
            if ($agent) {
                /*$agentMember = new Membership();
                $agentMember->space_id = $space->id;
                $agentMember->user_id = $user->id;
                $agentMember->status = Membership::STATUS_MEMBER;

                if ($agentMember->validate() && $agentMember->save()) {
                    $response->setStatusCode(400);
                    return ['errors' => $agentMember->getErrors()];
                }*/

                $space->addMember($agent->id);

                $agentWallMember = new WallContentMembership();
                $agentWallMember->content_container_id = $space->id;
                $agentWallMember->wall_id = $agentWall->id;
                $agentWallMember->user_id = $agent->id;

                if (!$agentWallMember->validate() || !$agentWallMember->save()) {
                    $response->setStatusCode(400);
                    return ['errors' => $agentWallMember->getErrors()];
                }
            }
        }

        $response->setStatusCode(201);
        return ['success' => true, 'errors' => []];
    }
}
