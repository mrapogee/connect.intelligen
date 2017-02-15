<?php

use yii\db\Migration;

class m170208_180141_alter_form_request extends Migration
{
    public function up()
    {
        $this->dropColumn('form_request', 'submission_id');
        $this->dropColumn('form_request', 'form_id');
        $this->dropColumn('form_request', 'branch_id');
    }

    public function down()
    {
        echo "m170208_180141_alter_form_request cannot be reverted.\n";

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
