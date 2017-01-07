<?php

namespace intelligen\modules\pcontent\components;

use Yii;
use humhub\modules\content\components\actions\ContentContainerStream;
use intelligen\modules\pcontent\models;
use humhub\modules\user\models\GroupUser;


class StreamAction extends ContentContainerStream
{
    public function setupFilters()
    {
        $this->activeQuery->andWhere([
            'content.object_model' => models\Content::className()
        ]);
    }

    public function filterContentType(string $type)
    {
        $content = models\Content::tableName();

        $this->activeQuery->leftJoin(
            $content,
            "content.object_id=$content.id AND content.object_model=:contentModel",
            [
                ':contentModel' => models\Content::className()
            ]
        );

        $this->activeQuery->andWhere([
            "$content.type" => $type
        ]);
    }
}