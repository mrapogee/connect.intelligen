<?php

use yii\db\Migration;

class m170208_140410_wall_user_id_guid extends Migration
{
    public function up()
    {
        $this->alterColumn(
            'wall',
            'user_id', 'varchar(50)'
        );
    }

    public function down()
    {
        echo "m170208_140410_wall_user_id_guid cannot be reverted.\n";

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
