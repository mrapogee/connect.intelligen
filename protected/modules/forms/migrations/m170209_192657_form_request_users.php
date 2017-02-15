<?php

use yii\db\Migration;

class m170209_192657_form_request_users extends Migration
{
    public function up()
    {
        $this->addColumn('form_request', 'users', 'text');
    }

    public function down()
    {
        echo "m170209_192657_form_request_users cannot be reverted.\n";

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
