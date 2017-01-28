<?php

use yii\db\Migration;

class m170127_201710_form_request extends Migration
{
    public function up()
    {
        $this->createTable('form_request', [
            'id' => 'pk',
            'submission_id' => 'varchar(30)',
            'form_id' => 'varchar(30) NOT NULL',
            'branch_id' => 'varchar(30) NOT NULL',
            'note' => 'text(512)'
        ]);
    }

    public function down()
    {
        echo "m170127_201710_form_request cannot be reverted.\n";

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
