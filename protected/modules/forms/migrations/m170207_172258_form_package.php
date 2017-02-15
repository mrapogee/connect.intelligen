<?php

use yii\db\Migration;

class m170207_172258_form_package extends Migration
{
    public function up()
    {
        $this->addColumn('form_request', 'items', 'text');
    }

    public function down()
    {
        echo "m170207_172258_form_package cannot be reverted.\n";

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
