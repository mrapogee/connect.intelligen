<?php

namespace intelligen\modules\forms\controllers;
use Yii;

use humhub\modules\content\components\ContentContainerController;
use humhub\modules\content\models\Wall;
use humhub\modules\space\models\Space;
use intelligen\modules\forms\models\FormRequest;
use intelligen\modules\forms\models\Form;
use intelligen\modules\pcontent\widgets\ActivityForm;

class SendController extends ContentContainerController {
    public function actions()
    {
        return [
            'stream' => [
                'class' => \intelligen\modules\forms\components\StreamAction::className(),
                'mode' => \intelligen\modules\pcontent\components\StreamAction::MODE_NORMAL,
                'contentContainer' => $this->contentContainer
            ],
        ];
    }

    public function actionIndex () {
        $forms = Form::find()->all();
        $formOptions = [];

        foreach ($forms as $form)  {
            if ($form->published) {
                $formOptions[(string) $form->_id] = $form->name;
            }
        }

        return $this->render('show', [
            'contentContainer' => $this->contentContainer,
            'forms' => $formOptions
        ]);
    }

    public function actionPost () {
        $body = Yii::$app->request->post();

        $form = new FormRequest();
        $form->form_id = $body['form'];
        $form->note = $body['notes'];
        $form->branch_id = Form::findOne($form->form_id)->published;

        return ActivityForm::create($form, $this->contentContainer);
    }
}