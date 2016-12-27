<?php

namespace intelligen\modules\pcontent\components;

use humhub\modules\content\components\actions\ContentContainerStream;
use intelligen\modules\pcontent\models\Content;


class StreamAction extends ContentContainerStream
{
    public function setupFilters()
    {
		// Limit output to specific content type
        $this->activeQuery->andWhere(['content.object_model' => Content::className()]);
    }
}