<?php

namespace intelligen\modules\pcontent\controllers;

use Yii;
use humhub\components\Controller;
use intelligen\modules\pcontent\components\CreateClientAcion;
use intelligen\modules\pcontent\models\Client;
use intelligen\modules\pcontent\models\Project;

class CreateController extends Controller {
    public $defaultAction = 'create-client';

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