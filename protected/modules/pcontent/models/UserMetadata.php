<?php

namespace intelligen\modules\pcontent\models;

use humhub\components\ActiveRecord;
use humhub\modules\search\interfaces\Searchable;

class UserMetadata extends ActiveRecord {
    public $wallEntryClass = 'humhub\modules\form\widgets\WallEntry';

    static function getForUser ($id) 
    {
        $md = UserMetadata::findOne(['user_id' => $id]);

        if (!$md) {
            $md = new UserMetadata();
            $md->user_id = $id;
            $md->roles = 'contact';
            $md->options = '{}';

            // Save
            $md->insert();
        }


        return $md;
    }

    public static function tableName()
    {
        return 'intelligen_user_metadata';
    }

    public function setRoles ($list) 
    {
        $this->roles = implode(',', $list);
    }

    public function getRoles () 
    {
        return array_map(
            function ($str) { return strtolower($str); }, 
            explode(',', $this->roles)
        );
    }

    public function hasRole ($role) 
    {
        return in_array(
            strtolower($role), 
            $this->getRoles()
        );
    }

    public function getContentName () 
    {
        return Yii::t('PcontentModule.models_UserMetadata', 'Form');
    }
}
