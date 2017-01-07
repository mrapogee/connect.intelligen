<?php

use yii\db\Migration;

class m161223_164352_special_content extends Migration
{
    private $sc_table = 'intelligen_special_content';
    private $scfg_table = 'intelligen_special_content_for_groups';
    private $scfg_group_index = 'intelligen_special_content_for_groups_group_index';
    private $scfg_content_index = 'intelligen_special_content_for_groups_content_index';

    public function up()
    {
        if (!in_array($this->sc_table, $this->getDb()->schema->tableNames)) {
            $this->createTable($this->sc_table, [
                'id' => 'pk',
                'type' => 'varchar(64)',
                'value' => 'text',
                'created_at' => 'datetime NOT NULL',
                'created_by' => 'int(11) NOT NULL',
                'updated_at' => 'datetime NOT NULL',
                'updated_by' => 'int(11) NOT NULL',
            ], '');
        }


        if (!in_array($this->scfg_table, $this->getDb()->schema->tableNames)) {
            $this->createTable($this->scfg_table, [
                'id' => 'pk',
                'group_id' => 'int(11) NOT NULL',
                'content_id' => 'int(11) NOT NULL',
            ], '');

            $this->createIndex($this->scfg_group_index, $this->scfg_table, 'group_id', false);
            $this->createIndex($this->scfg_content_index, $this->scfg_table, 'content_id', false);
        }
    }

    public function down()
    {
        echo "m161223_164352_special_content cannot be reverted.\n";

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
