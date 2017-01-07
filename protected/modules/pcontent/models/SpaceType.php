<?php

namespace intelligen\modules\pcontent\models;

use humhub\components\ActiveRecord;
use humhub\modules\search\interfaces\Searchable;

class SpaceType extends ActiveRecord {
    public static function tableName()
    {
        return 'intelligen_space_type';
    }
}
