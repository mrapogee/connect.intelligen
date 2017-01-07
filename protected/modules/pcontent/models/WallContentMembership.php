<?php

namespace intelligen\modules\pcontent\models;

use humhub\components\ActiveRecord;
use humhub\modules\search\interfaces\Searchable;

class WallContentMembership extends ActiveRecord {
    public static function tableName()
    {
        return 'intelligen_wall_content_membership';
    }
}
