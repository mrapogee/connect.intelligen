<?php

namespace intelligen\modules\forms\components;

use Yii;
use humhub\modules\content\components\actions\ContentContainerStream;
use humhub\modules\user\models\GroupUser;
use intelligen\modules\forms\models\FormRequest;


class StreamAction extends ContentContainerStream
{
    public function setupFilters()
    {
        $this->activeQuery->andWhere([
            'content.object_model' => FormRequest::className()
        ]);
    }
}