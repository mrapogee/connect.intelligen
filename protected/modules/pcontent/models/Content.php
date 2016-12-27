<?php

namespace intelligen\modules\pcontent\models;

use humhub\modules\content\components\ContentActiveRecord;
use humhub\modules\search\interfaces\Searchable;

class Content extends ContentActiveRecord {
    const SCENARIO_CREATE = 'create';
    const SCENARIO_EDIT = 'edit';

    public $wallEntryClass = 'intelligen\modules\pcontent\WallEntry';
    public $autoAddToWall = true;

    protected static function beforeFind ($event)
    {
        $query = $event->getDbCriteria();
        var_dump($event);
    }

    public static function tableName()
    {
        return 'intelligen_special_content';
    }
 
    public function scenarios()
    {
        return [
            self::SCENARIO_CREATE => ['value', 'type'],
            self::SCENARIO_EDIT => ['value'],
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
        return 'Content';
    }

    /**
     * @inheritdoc
     */
    public function getContentDescription()
    {
        return 'desc';
    }
}
