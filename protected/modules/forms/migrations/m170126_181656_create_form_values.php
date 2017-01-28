<?php

use yii\mongodb\Migration;

class m170126_181656_create_form_values extends Migration
{
    public function init () {
        $this->db = Yii::$app->mongodb;
        parent::init();
    }

    public function up()
    {
        $this->createCollection('formValues', []);
    }

    public function down()
    {
        echo "m170126_181656_create_form_values cannot be reverted.\n";

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
