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

class CreateProjectAction extends \yii\base\Action {
    public function getData () {
        $data = Yii::$app->request->post();

        return $data;
    }

    public function run () {
        $data = $this->getData();
        $response = Yii::$app->getRespones();

        $admin = User::findOne(5);
        Yii::$app->user->switchIdentity($admin, 0);

        $user = User::findOne(['email' => $data['email']]);

        if ($user === null) {
            $response->setStatusCode(400);
            return ['errors' => [['message' => 'Create client before creating deal']]];
        }

        $spaceName = "Deal - $data[lastname] $data[address][street]";
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
    }
}
