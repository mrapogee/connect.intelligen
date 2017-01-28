<?php

use yii\db\Migration;

class m170127_213402_form_request_pk extends Migration
{
    public function up()
    {

    }

    public function down()
    {
        echo "m170127_213402_form_request_pk cannot be reverted.\n";

        $this->addColumn('form_request', 'id', 'pk');

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
