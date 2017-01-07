<?php

namespace intelligen\modules\pcontent\controllers;
use Yii;

use humhub\modules\content\components\ContentContainerController;
use humhub\modules\content\models\Wall;
use humhub\modules\space\models\Space;
use intelligen\modules\pcontent\models\Content;
use intelligen\modules\pcontent\widgets\WallCreateContentForm;
use intelligen\modules\pcontent\components\JotClient;

class ContentController extends ContentContainerController {
    static public function getGroups () {
        return [
            'bidder' => 'Bidder',
            'acme-bidder' => 'Acme Bidder',
            'foobar-bidder' => 'Foobar Bidder',
            'customer' => 'Customer',
            'sales' => 'Sales Agent',
            'designer' => 'Designer',
        ];
    }

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

    public function actionLogActivity($activity_type = '')
    {
        $activity = new Content();
        $activity->content->container = $this->contentContainer;

        $body = Yii::$app->request->post();
        if ($activity->loadActivity($body)) {
            if ($activity->validate() && $activity->save()) {
                return $this->htmlRedirect($this->contentContainer->createUrl('log-activity'));
            }
        }

        return $this->render('logActivity', [
            'contentContainer' => $this->contentContainer,
            'activityType' => $activity_type,
            'activity' => $activity
        ]);
    }

    public function actionLogForms()
    {
        $client = JotClient::instance();
        $forms = \yii\helpers\ArrayHelper::map($client->getForms(), 'id', 'title');
        $walls = Wall::find()->where(['object_model' => Space::className(), 'object_id' => $this->contentContainer->id])->all();
        $default_wall_id = $this->contentContainer->wall_id;
        $walls = array_filter($walls, function ($wall) use ($default_wall_id) { return $wall->id !== $default_wall_id; });
        $walls = \yii\helpers\ArrayHelper::map($walls, 'id', 'title');

        $form = new Content();
        $form->content->container = $this->contentContainer;

        $body = Yii::$app->request->post();
        if ($form->loadForm($body)) {
            if ($form->validate() && $form->save()) {
                return $this->htmlRedirect($this->contentContainer->createUrl('log-forms'));
            }
        }

        return $this->render('logForms', [
            'contentContainer' => $this->contentContainer,
            'forms' => $forms,
            'walls' => $walls,
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
