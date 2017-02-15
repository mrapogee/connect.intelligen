<?php

namespace intelligen\modules\actions\controllers;

use Yii;
use humhub\modules\content\components\ContentContainerController;
use humhub\modules\content\models\Wall;
use humhub\modules\user\models\User;
use humhub\modules\space\models\Space;
use intelligen\modules\actions\components\WaggleClient;
use yii\helpers\Inflector;

class InstanceController extends ContentContainerController {
    public function actions()
    {
        return [
            'stream' => [
                'class' => \intelligen\modules\forms\components\StreamAction::className(),
                'mode' => \intelligen\modules\pcontent\components\StreamAction::MODE_NORMAL,
                'contentContainer' => $this->contentContainer
            ],
        ];
    }

    static function parseGuids ($guids) {
        $list = explode(",", $guids);
        $list = array_map(
            function ($item) { return preg_replace("/[^A-Za-z0-9\-]/", '', $item); },
            $list
        );

        return array_filter($list);
    }

    public function findRole ($roleId, $roles) {
        foreach ($roles as $role) {
            if ($role->id === $roleId) {
                return $role;
            }
        }

        return null;
    }

    static public function findStep ($instance) {
        foreach ($instance->process->steps as $step) {
            if ($step->id === $instance->currentStep) {
                return $step;
            }
        }

        return null;
    }

    public function actionIndex () {
        $instanceId = Yii::$app->getModule('actions')->settings
            ->contentContainer($this->contentContainer)->get('instance');
        $instance = WaggleClient::getInstance($instanceId);
        $steps = $instance->process->steps;

        $post = Yii::$app->request->post();

        if (isset($post['updateProcess'])) {
            WaggleClient::updateInstance($instanceId, $this->contentContainer);
        }

        if (isset($post['roles'])) {
            $roles = [];
            foreach ($post['roles'] as $roleId => $memberGuids) {
                $role = self::findRole($roleId, $instance->process->roles);
                $members = self::parseGuids($memberGuids);
                $roles[$roleId] = [
                    'members' => $members
                ];

                $walls = Wall::findAll(['role_id' => $roleId, 'object_id' => $this->contentContainer->id]);
                foreach ($walls as $wall) {
                    $wall->delete();
                }

                $roleWall = new Wall();
                $roleWall->title = Inflector::pluralize($role->name);
                $roleWall->object_id = $this->contentContainer->id;
                $roleWall->object_model = Space::className();
                $roleWall->role_id = $roleId;
                $roleWall->user_id = null;
                $roleWall->save();

                foreach ($members as $member) {
                    $user = User::findByGuid($member);
                    $wall = new Wall();
                    $wall->title = $role->name . ' - ' . $user->getDisplayName();
                    $wall->object_id = $this->contentContainer->id;
                    $wall->object_model = Space::className();
                    $wall->role_id = $roleId;
                    $wall->user_id = $member;
                    $wall->save();
                }

                foreach ($members as $guid) {
                    $user = User::findByGuid($guid);
                    $personalWalls = array_map(
                        function ($wall) { return $wall->id; },
                        Wall::findAll(['object_id' => $this->contentContainer->id, 'user_id' => $guid])
                    );
                    $this->contentContainer->addMember(
                        $user->id,
                        1,
                        array_merge($personalWalls, [$roleWall->id, $this->contentContainer->wall_id])
                    );
                }
            }

            $instance = WaggleClient::patchInstance($instanceId, ['roles' => $roles]);
        }

        return $this->render('show', [
            'roles' => $instance->process->roles,
            'values' => $instance->roles,
            'steps' => $instance->process->steps,
            'instance' => $instance,
            'contentContainer' => $this->contentContainer
        ]);
    }
}