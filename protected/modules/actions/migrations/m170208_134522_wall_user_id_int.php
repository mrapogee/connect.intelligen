<?php

use yii\db\Migration;

class m170208_134522_wall_user_id_int extends Migration
{
    public function up()
    {
        $this->alterColumn(
            'wall',
            'user_id', 'int(11)'
        );
    }

    public function down()
    {
        echo "m170208_134522_wall_user_id_int cannot be reverted.\n";

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
