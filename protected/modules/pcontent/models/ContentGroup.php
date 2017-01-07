<?php

namespace intelligen\modules\pcontent\models;

use humhub\components\ActiveRecord;
use humhub\modules\search\interfaces\Searchable;

class ContentGroup extends ActiveRecord {
    public static function tableName()
    {
        return 'intelligen_special_content_for_groups';
    }
}
