<?php

namespace intelligen\modules\pcontent\controllers;
use Yii;

use humhub\modules\content\components\ContentContainerController;
use humhub\modules\content\models\Wall;
use humhub\modules\space\models\Space;
use intelligen\modules\pcontent\models\Content;
use intelligen\modules\pcontent\widgets\WallCreateContentForm;
use intelligen\modules\pcontent\components\JotClient;
use intelligen\modules\pcontent\widgets\ActivityForm;
use intelligen\modules\pcontent\widgets\FormFrom;

class ContentController extends ContentContainerController {
    public function actions()
    {
        return [
            'stream' => [
                'class' => \intelligen\modules\pcontent\components\StreamAction::className(),
                'mode' => \intelligen\modules\pcontent\components\StreamAction::MODE_NORMAL,
                'contentContainer' => $this->contentContainer
           ],
           'form-stream' => [
                'class' => \intelligen\modules\pcontent\components\FormStreamAction::className(),
                'mode' => \intelligen\modules\pcontent\components\FormStreamAction::MODE_NORMAL,
                'contentContainer' => $this->contentContainer
           ],
           'activity-stream' => [
                'class' => \intelligen\modules\pcontent\components\ActivityStreamAction::className(),
                'mode' => \intelligen\modules\pcontent\components\ActivityStreamAction::MODE_NORMAL,
                'contentContainer' => $this->contentContainer
           ],
           'message-stream' => [
                'class' => \intelligen\modules\pcontent\components\MessageStreamAction::className(),
                'mode' => \intelligen\modules\pcontent\components\MessageStreamAction::MODE_NORMAL,
                'contentContainer' => $this->contentContainer
           ]
        ];
    }

    public function actionPostActivity() {
        $activity = new Content();
        $activity->content->container = $this->contentContainer;

        $body = Yii::$app->request->post();
        $activity->loadActivity($body);

        return ActivityForm::create($activity, $this->contentContainer);
    }

    public function actionLogActivity($activity_type = '')
    {
        $activity= new Content();
        $activity->content->container = $this->contentContainer;

        return $this->render('logActivity', [
            'contentContainer' => $this->contentContainer,
            'activity' => $activity,
            'activityType' => $activity_type,
        ]);
    }

    public function actionPostForm() {
        $form = new Content();
        $form->content->container = $this->contentContainer;

        $body = Yii::$app->request->post();
        $form->loadForm($body);

        return ActivityForm::create($form, $this->contentContainer);
    }
    

    public function actionLogForms()
    {
        $client = JotClient::instance();
        $forms = \yii\helpers\ArrayHelper::map($client->getForms(), 'id', 'title');

        $form = new Content();
        $form->content->container = $this->contentContainer;

        return $this->render('logForm', [
            'contentContainer' => $this->contentContainer,
            'forms' => $forms,
            'form' => $form,
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
