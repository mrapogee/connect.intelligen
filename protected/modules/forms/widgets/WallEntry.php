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

        $form = $formRequest->getForm();
        $submission = $formRequest->getSubmission();

        return $this->render('formWallEntry', [
            'submitUrl' => Url::to(['/api/v1/submission']),
            'formRequest' => $formRequest,
            'form' => $form,
            'submission' => $submission,
            'user' => $this->contentObject->content->user,
            'contentContainer' => $this->contentObject->content->container
        ]);
    }

}