<?php

use yii\db\Migration;
use intelligen\modules\pcontent\models\WallContentMembership;

class m161228_174049_global_grouped_content extends Migration
{
    
    public function up()
    {
        $wall_content_membership = WallContentMembership::tableName();
        $wall_index = $wall_content_membership . '_wall_index';
        $user_index = $wall_content_membership . '_user_index';
        $content_index = $wall_content_membership . '_content_container_index';

        if (!in_array($wall_content_membership, $this->getDb()->schema->tableNames)) {
            $this->createTable(
                $wall_content_membership,
                [
                    'id' => 'pk',
                    'wall_id' => 'int(11) NOT NULL',
                    'user_id' => 'int(11) NOT NULL',
                    'content_container_id' => 'int(11) NOT NULL',
                ]
            );

            $this->createIndex($wall_index, $wall_content_membership, 'wall_id', false);
            $this->createIndex($user_index, $wall_content_membership, 'content_container_id', false);
            $this->createIndex($content_index, $wall_content_membership, 'user_id', false);
        }
    }

    public function down()
    {
        echo "m161228_174049_global_grouped_content cannot be reverted.\n";

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
