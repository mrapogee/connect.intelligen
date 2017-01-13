<?php

namespace intelligen\modules\egnyte\models;

use humhub\modules\content\components\ContentActiveRecord;


class Folder extends ContentActiveRecord {
    public $wallEntryClass = 'intelligen\modules\egnyte\widgets\FolderEntry';

    public static function tableName () {
        return 'egnyte_folder';
    }

    public function rules () {
        return [
            [['embed_link', 'name'], 'required'],
            ['name', 'string', 'max' => 150],
            ['embed_link', 'string', 'max' => 250]
        ];
    }

    public function attributeLabels () {
        return [
            'embed_link' => 'Egnyte Shared Link',
            'name' => 'Folder Name'
        ];
    }
}