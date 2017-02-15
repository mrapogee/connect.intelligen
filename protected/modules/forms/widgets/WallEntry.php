<?php

namespace intelligen\modules\forms\widgets;

use Yii;
use yii\db\Query;
use yii\helpers\Url;

class WallEntry extends \humhub\modules\content\widgets\WallEntry
{
    public $editRoute = "forms/send/edit";

    public function run()
    {
        $formRequest = $this->contentObject;

        $items = $formRequest->getItems();

        return $this->render('formWallEntry', [
            'submitUrl' => Url::to(['/api/v1/submission']),
            'formRequest' => $formRequest,
            'items' => $items,
            'user' => $this->contentObject->content->user,
            'contentContainer' => $this->contentObject->content->container
        ]);
    }

}