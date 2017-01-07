<?php

use yii\db\Migration;

class m161227_162101_groups extends Migration
{
    private $groups_table = 'intelligen_project_groups';

    public function up()
    {
        if (!in_array($this->groups_table, $this->getDb()->schema->tableNames)) {
            $this->createTable($this->groups_table, [
                'space_id' => 'int(11) NOT NULL PRIMARY KEY',
                'customers_group' => 'int(11) NOT NULL',
                'company_group' => 'int(11) NOT NULL',
                'sales_group' => 'int(11) NOT NULL',
                'administration_group' => 'int(11) NOT NULL',
                'bidding_groups' => 'text NOT NULL',
            ], '');
        }
    }

    public function down()
    {
        echo "m161227_162101_groups cannot be reverted.\n";

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
