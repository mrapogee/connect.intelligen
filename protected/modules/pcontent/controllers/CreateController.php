<?php

namespace intelligen\modules\pcontent\controllers;

use Yii;
use humhub\components\Controller;
use intelligen\modules\pcontent\components\CreateClientAcion;
use intelligen\modules\pcontent\models\Client;
use intelligen\modules\pcontent\models\CreateExistingClient;
use intelligen\modules\pcontent\models\Project;
use humhub\modules\user\models\User;

class CreateController extends Controller {
    public $defaultAction = 'create-client';

    public function actionCreateClientStart () {
        return $this->renderAjax('createOptions');
    }

    public function actionCreateClientExisting () {
        $model = new CreateExistingClient();

        if ($model->load(Yii::$app->request->post()) && $model->validate() && $model->save()) {
            return $this->htmlRedirect($model->client->space->getUrl());
        }

        return $this->renderAjax('clientExisting', ['model' => $model]);
    }

    public function actionCreateClient () {
        $client = new Client();

        if ($client->load(Yii::$app->request->post()) && $client->validate()) {
            $result = $client->createClient();

            if (isset($result['success']) && $result['success']) {
                return $this->htmlRedirect($client->space->getUrl());
            } else {
                return $this->actionProblem($result);
            }
        }

        return $this->renderAjax('client', ['client' => $client]);
    }

    public function actionCreateProject () {
        $project = new Project();

        if ($project->load(Yii::$app->request->post()) && $project->validate()) {
            $result = $project->createProject();

            if (isset($result['success']) && $result['success']) {
                return $this->htmlRedirect($project->space->getUrl());
            } else {
                return $this->actionProblem($result);
            }
        }

        return $this->renderAjax('project', ['project' => $project]);
    }

    public function actionProblem ($problem) {
        return $this->renderAjax('problem', ['problem' => $problem]);
    }
}

?>