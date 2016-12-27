<?php

use yii\db\Migration;

class m161223_164352_special_content extends Migration
{

    public function up()
    {
        $this->createTable('intelligen_special_content', [
            'id' => 'pk',
            'type' => 'varchar(64)',
            'value' => 'text',
            'created_at' => 'datetime NOT NULL',
            'created_by' => 'int(11) NOT NULL',
            'updated_at' => 'datetime NOT NULL',
            'updated_by' => 'int(11) NOT NULL',
        ], '');

        $this->createTable('intelligen_special_content_for_groups', [
            'group_id' => 'pk',
            'content_id' => 'pk',
        ], '');
    }

    public function down()
    {
        echo "m161223_164352_special_content cannot be reverted.\n";

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
