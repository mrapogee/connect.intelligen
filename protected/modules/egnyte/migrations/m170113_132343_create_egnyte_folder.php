<?php

use yii\db\Migration;
use intelligen\modules\egnyte\models\Folder;

class m170113_132343_create_egnyte_folder extends Migration
{
    public function up()
    {
        $folderTable = Folder::tableName();

        $this->createTable($folderTable, [
            'embed_link' => 'varchar(250)',
            'name' => 'varchar(150)',
        ]);
    }

    public function down()
    {
        echo "m170113_132343_create_egnyte_folder cannot be reverted.\n";

        return false;
    }

    /*
    // Use safeUp/safeDown to run migration code within a transaction
    public function safeUp()
    {
    }

    public function safeDown()
    {
    }
    */
}
