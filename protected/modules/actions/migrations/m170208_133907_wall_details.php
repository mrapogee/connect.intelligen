<?php

use yii\db\Migration;

class m170208_133907_wall_details extends Migration
{
    public function up()
    {
        $this->addColumn(
            'wall',
            'role_id', 'varchar(64)'
        );

        $this->addColumn(
            'wall',
            'user_id', 'varchar(64)'
        );
    }

    public function down()
    {
        echo "m170208_133907_wall_details cannot be reverted.\n";

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
