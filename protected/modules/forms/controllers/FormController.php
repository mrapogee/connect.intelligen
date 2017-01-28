<?php

namespace intelligen\modules\forms\controllers;

use Yii;
use yii\rest\ActiveController;
use intelligen\modules\forms\models\Form;
use intelligen\modules\forms\models\FormRequest;

class FormController extends ActiveController
{
    public $modelClass = 'intelligen\modules\forms\models\Form';

    /* public function actionCreate () {
        $form = new Form();

        $form->load(Yii::$app->request->post(), '');

        if ($form->validate() && $form->save()) {
            return json_encode($model->getAttributes($model->attributes()));
        }

        Yii::$app->response->setStatus(400);
        return [
            errors => $from->getErrors()
        ];
    }*/

    public function actionSubmit () {
        $body = Yii::$app->request->post();
        $formRequestId = $body['_id'];
        $formValue = $body['data'];

        $formRequest = FormRequest::findOne($formRequestId);
        $formRequest->submit($formValue);
    }

    public function actionUpdateBranch () {
        $formId = Yii::$app->request->queryParams['id'];
        $branchId = Yii::$app->request->queryParams['branch'];

        $form = Form::findOne($formId);
        if ($form) {
            $branches = $form->branches;
            $branches[$branchId] = Yii::$app->request->post();
            $form->branches = $branches;

            if ($form->validate() && $form->save()) {
                return Yii::$app->request->post();
            }
        } else {
            throw new yii\web\HttpException(404, 'Could not find requested form.');
        }

        Yii::$app->response->statusCode = 400;
        return [
            errors => $from->getErrors()
        ];
    }
}
