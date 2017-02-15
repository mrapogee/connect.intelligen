<?php

namespace humhub\modules\content\models;

use humhub\components\ActiveRecord;
use intelligen\modules\pcontent\models\WallContentMembership;

/**
 * This is the model class for table "wall".
 *
 * @property integer $id
 * @property string $object_model
 * @property integer $object_id
 * @property string $created_at
 * @property integer $created_by
 * @property string $updated_at
 * @property integer $updated_by
 */
class Wall extends ActiveRecord
{
    public $wall;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'wall';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['object_model', 'object_id'], 'required'],
            [['object_id'], 'integer'],
            [['object_model', 'title', 'role_id', 'user_id'], 'string', 'max' => 50]
        ];
    }

    public function afterDelete () {
        parent::afterDelete();

        foreach (WallContentMembership::findAll(['wall_id' => $this->id]) as $spaceMembership) {
            $spaceMembership->delete();
        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'object_model' => 'Object Model',
            'object_id' => 'Object ID',
            'title' => 'Title',
            'role_id' => 'Role',
            'user_id' => 'Content',
            'created_at' => 'Created At',
            'created_by' => 'Created By',
            'updated_at' => 'Updated At',
            'updated_by' => 'Updated By',
        ];
    }
}
