<?php

namespace humhub\modules\form\models;

use humhub\modules\content\components\ContentActiveRecord;
use humhub\modules\search\interfaces\Searchable;

class Form extends ContentActiveRecord {
    public $wallEntryClass = 'humhub\modules\form\widgets\WallEntry';

    public static function tableName()
    {
        return 'intelligen_form_request';
    }

    public function scenarios()
    {
        return [];
    }

    public function rules()
    {
        return array();
    }

    public function getContentName () 
    {
        return Yii::t('FormsModule.models_IntelligenForm', 'Form');
    }

    public function attributeLabels()
    {
        return array();
    }

    public function getContentDescription ()
    {
        return $this->form_label;
    }
}
