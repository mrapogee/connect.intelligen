<?php

use yii\db\Migration;

class m161227_191157_rest_api extends Migration
{
    private $rest_user_table = 'intelligen_rest_user';
    private $rest_user_key_index = 'intelligen_rest_user_key_index';

    public function up()
    {
        if (!in_array($this->rest_user_table, $this->getDb()->schema->tableNames)) {
            $this->createTable($this->rest_user_table, [
                'id' => 'pk',
                'key' => 'varchar(64)',
                'email' =>  'varchar(64)'
            ], '');

            $this->createIndex($this->rest_user_key_index, $this->rest_user_table, 'key', true);
        }
    }

    public function down()
    {
        echo "m161227_191157_rest_api cannot be reverted.\n";

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
