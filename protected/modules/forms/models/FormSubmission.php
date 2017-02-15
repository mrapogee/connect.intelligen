<?php

namespace intelligen\modules\forms\models;

class FormSubmission extends \yii\mongodb\ActiveRecord {
    const SCENARIO_DEFAULT = 'default';

    public static function collectionName()
    {
        return 'formValues';
    }

    public function attributes()
    {
        return ['_id', 'formId', 'branchId', 'value', 'processAttributes', 'submittedBy'];
    }

    public function scenarios()
    {
        return [
            self::SCENARIO_DEFAULT => $this->attributes()
        ];
    }

    public function rules()
    {
        return array();
    }
}
