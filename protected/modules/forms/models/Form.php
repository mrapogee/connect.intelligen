<?php

namespace intelligen\modules\forms\models;

class Form extends \yii\mongodb\ActiveRecord {
    const SCENARIO_DEFAULT = 'default';

    public function fields () {
        return ['id' => '_id', 'name' => 'name', 'branches' => 'branches', 'latestBranch' => 'latestBranch'];
    }

    public function attributes()
    {
        return ['_id', 'name', 'branches', 'latestBranch'];
    }

    public function scenarios()
    {
        return [
            self::SCENARIO_DEFAULT => ['name', 'branches', 'latestBranch']
        ];
    }    

    public static function collectionName()
    {
        return 'forms';
    }

    public function rules()
    {
        return array();
    }
}
