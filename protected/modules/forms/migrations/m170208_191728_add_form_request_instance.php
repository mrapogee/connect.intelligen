<?php

use yii\db\Migration;

class m170208_191728_add_form_request_instance extends Migration
{
    public function up()
    {
        $this->addColumn('form_request', 'instance_id', 'varchar(50)');
    }

    public function down()
    {
        echo "m170208_191728_add_form_request_instance cannot be reverted.\n";

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
