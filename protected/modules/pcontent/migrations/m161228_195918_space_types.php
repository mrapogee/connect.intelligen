<?php

use yii\db\Migration;
use intelligen\modules\pcontent\models\SpaceType;
use humhub\modules\content\models\Wall;

class m161228_195918_space_types extends Migration
{
    public function up()
    {
        $space_type = SpaceType::tableName();
        $space_index = $space_type . 'space_index';

        if (!in_array($space_type, $this->getDb()->schema->tableNames)) {
            return $this->createTable(
                $space_type,
                [
                    'id' => 'pk',
                    'space_id' => 'int(11) NOT NULL',
                    'type' => 'varchar(64) NOT NULL',
                ]
            );

            $this->createIndex($space_index, $space_type, 'space_id', false);
        }
    }

    public function down()
    {
        echo "m161228_195918_space_types cannot be reverted.\n";

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
