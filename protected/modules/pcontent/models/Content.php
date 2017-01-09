<?php

namespace intelligen\modules\pcontent\models;

use Yii;
use humhub\modules\content\components\ContentActiveRecord;
use humhub\modules\search\interfaces\Searchable;
use humhub\modules\user\models\GroupUser;
use humhub\modules\content\models\WallEntry;
use humhub\modules\content\models\Wall;
use humhub\modules\user\models\User;
use humhub\modules\space\models\Space;
use intelligen\modules\pcontent\components\JotClient;

class Content extends ContentActiveRecord {
    const SCENARIO_DEFAULT = 'default';
    const SCENARIO_CREATE = 'create';
    const SCENARIO_EDIT = 'edit';
    const GROUP_OWNERS = 'intelligen_special_content_for_groups';

    public $wallEntryClass = 'intelligen\modules\pcontent\widgets\WallEntry';
    public $autoAddToWall = false;
    public $data = [];
    public $customWallManagement = true;

    public static function tableName()
    {
        return 'intelligen_special_content';
    }

    public function loadType($type, $value) {
        $functionName = 'load' . implode(
            '',
            array_map(function ($l) { return ucfirst($l); }, explode('-', $type))
        );

        // Log user in        
        $admin = User::findOne(Yii::$app->params['adminID']);
        Yii::$app->user->switchIdentity($user, 0);

        // Get content container
        $space = Space::findOne($value['space_id']);
        $this->content->container = $space;

        $this->scenario = self::SCENARIO_CREATE;

        return $this->$functionName($value);
    }

    public function loadForm($post) {
        if (isset($post['form_name'])) {
            $post['form'] = $post['form_name'];
        }

        if (isset($post['note_text'])) {
            $post['notes'] = $post['note_text'];
        }

        if (isset($post['form']) && isset($post['notes'])) {
            $this->data['form'] = $post['form'];
            $this->data['groups'] = isset($post['groups']) ? $post['groups'] : [];
            $this->data['notes'] = $post['notes'];
            $this->value = json_encode($this->data);
            $this->type = 'form';
            $this->scenario = self::SCENARIO_CREATE;

            return true;
        }

        return false;
    }

    public function loadActivity($post) {
        if (isset($post['activity_type']) && isset($post['message'])) {
            $this->data['activity_type'] = $post['activity_type'];
            $this->data['message'] = $post['message'];

            $salesWall = Wall::findOne([
                'object_model' => Space::className(),
                'object_id' => $this->content->container->id,
                'title' => 'Agent'
            ]);

            if ($salesWall !== null) {
                $this->data['groups'] = [ $salesWall->id ];
            }

            $this->value = json_encode($this->data);
            $this->type = 'activity';
            $this->scenario = self::SCENARIO_CREATE;

            return true;
        }

        return false;
    }

    public function afterSave($insert, $changed) {
        parent::afterSave($insert, $changed);

        if ($this->type === 'form') {
            $ccId = $this->content->container->id;
            $data = json_decode($this->value);
            $walls = $data->groups;

            foreach ($this->content->getWallEntries() as $entry) {
                $entry->delete();
            }

            if (is_array($walls)) {
                foreach ($walls as $wall) {
                    $this->content->addToWall($wall);
                }
            }
        }
        
        if ($this->type === 'activity') {
            $ccId = $this->content->container->id;
            $data = json_decode($this->value);
            $walls = isset($data->groups) ? $data->groups : [];

            foreach ($this->content->getWallEntries() as $entry) {
                $entry->delete();
            }

            if (is_array($walls)) {
                foreach ($walls as $wall) {
                    $this->content->addToWall($wall);
                }
            }
        }

        return true;
    }

    public function scenarios()
    {
        return [
            self::SCENARIO_CREATE => ['value', 'type'],
            self::SCENARIO_EDIT => ['value'],
            self::SCENARIO_DEFAULT => ['value', 'type']
        ];
    }

    public function rules()
    {
        return []; 
    }

    /**
     * @inheritdoc
     */
    public function getContentName()
    {
        return ucfirst($this->type);
    }

    /**
     * @inheritdoc
     */
    public function getContentDescription()
    {
        return '';
    }
}
