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



class Project extends Model {
    public $client;
    public $street_address;
    public $city;
    public $state;
    public $country;
    public $postal_code;
    public $agent_email;

    public $client_user;
    public $space;

    function rules () {
        return [
            [['street_address', 'city', 'state', 'country', 'postal_code', 'client'], 'required'],
            [['client'], 'checkClient'],
            [['street_address', 'city', 'state', 'country', 'postal_code', 'agent_email'], 'string'],
            [['agent_email'], 'email']
        ];
    }

    public function checkClient($attribute, $params)
    {
        $userGuid= explode(",", $this->$attribute)[0];
        $userGuid = preg_replace("/[^A-Za-z0-9\-]/", '', $userGuid);

        if ($userGuid == "") {
            $this->addError($attribute, 'Please select a valid user.');
            return;
        }

        // Try load user
        $user = User::findOne(['guid' => $userGuid]);
        $this->client_user = $user;
        if ($user == null) {
            $this->addError($attribute, Yii::t('SpaceModule.forms_SpaceInviteForm', "User not found!"));
        }
    }
    function createProject () {
        $user = $this->client_user;

        if ($user === null) {
            return ['errors' => [['message' => 'Create client before creating deal']]];
        }

        $profile = $user->profile;
        $spaceName = "Project - $profile->lastname, $this->street_address";
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

        $this->space = $space;
        $space->enableModule('pcontent');

        return [
            'success' => true, 'errors' => []
        ];
    }
}