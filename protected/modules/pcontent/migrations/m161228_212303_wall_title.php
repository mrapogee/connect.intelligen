<?php

use yii\db\Migration;
use humhub\modules\content\models\Wall;

class m161228_212303_wall_title extends Migration
{
    public function up()
    {
        $wall = Wall::tableName();

        $this->addColumn(
            $wall,
            'title', 'varchar(64) NOT NULL DEFAULT "Default"' 
        );
    }

    public function down()
    {
        echo "m161228_212303_wall_title cannot be reverted.\n";

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
