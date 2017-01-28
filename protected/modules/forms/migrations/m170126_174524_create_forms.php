<?php

use yii\mongodb\Migration;

class m170126_174524_create_forms extends Migration
{
    public function init () {
        $this->db = Yii::$app->mongodb;
        parent::init();
    }

    public function up()
    {
        $this->createCollection('forms', []);
    }

    public function down()
    {
        echo "m170126_174524_create_forms cannot be reverted.\n";

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
