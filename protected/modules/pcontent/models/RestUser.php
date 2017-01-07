<?php

namespace intelligen\modules\pcontent\models;

use humhub\components\ActiveRecord;
use humhub\modules\search\interfaces\Searchable;

class RestUser extends ActiveRecord {
    public static function tableName()
    {
        return 'intelligen_rest_user';
    }

    public static function isAllowed($key) {
        $v = RestUser::findOne(['key' => $key]);

        if ($v) {
            return true;
        }

        return false;
    }
}
