<?php

use yii\db\Migration;

class m161221_122927_initial extends Migration
{
    public function up()
    {
        $this->createTable('intelligen_form', array(
            'id' => 'pk',
            'form_label' => 'VARCHAR(64) NOT NULL',
            'request_id' => 'int(11)',
            'values' => 'text NOT NULL',
            'jot_submission_id' => 'VARCHAR(32) NOT NULL',
            'created_at' => 'datetime NOT NULL',
            'created_by' => 'int(11) NOT NULL',
            'updated_at' => 'datetime NOT NULL',
            'updated_by' => 'int(11) NOT NULL'
        ), '');

        $this->createTable('intelligen_form_request', array(
            'id' => 'pk',
            'recipients' => 'text NOT NULL',
            'form_id' => 'int(11)',
            'space_id' => 'int(11) NOT NULL',
            'form_label' => 'VARCHAR(64) NOT NULL',
            'jot_form_id' => 'VARCHAR(32) NOT NULL',
            'created_at' => 'datetime NOT NULL',
            'created_by' => 'int(11) NOT NULL',
            'updated_at' => 'datetime NOT NULL',
            'updated_by' => 'int(11) NOT NULL'
        ), '');
    }

    public function down()
    {
        echo "m161221_122927_initial cannot be reverted.\n";

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
