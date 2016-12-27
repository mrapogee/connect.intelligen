<?php

namespace intelligen\modules\pcontent\controllers;
use Yii;

use humhub\modules\content\components\ContentContainerController;
use intelligen\modules\pcontent\models\Content;
use intelligen\modules\pcontent\widgets\WallCreateContentForm;

class ContentController extends ContentContainerController {
    public function actions()
    {
        return [
            'stream' => [
                'class' => \humhub\modules\polls\components\StreamAction::className(),
                'mode' => \intelligen\modules\pcontent\components\StreamAction::MODE_NORMAL,
                'contentContainer' => $this->contentContainer
           ]
        ];
    }

    public function actionLogActivity($activity_type)
    {
        return $this->render('logActivity', [
            'contentContainer' => $this->contentContainer,
            'activityType' => $activity_type
        ]);
    }

    public function actionShow()
    {
        return $this->render('show', [
            'contentContainer' => $this->contentContainer
        ]);
    }

    public function actionCreate()
    {
        if (!$this->contentContainer->permissionManager->can(new \intelligen\modules\pcontent\permissions\CreateContent())) {
            throw new HttpException(400, 'Access denied!');
        }

        $content = new Content();
        $content->scenario = Content::SCENARIO_CREATE;
        $content->type = Yii::$app->request->post('type');
        $content->value = Yii::$app->request->post('value');

        return WallCreateContentForm::create($content, $this->contentContainer);
    }
}
