<?php

namespace intelligen\modules\pcontent\controllers;

use Yii;
use humhub\components\Controller;
use intelligen\modules\pcontent\components\CreateClientAcion;
use intelligen\modules\pcontent\models\Client;
use intelligen\modules\pcontent\models\Project;
use humhub\modules\user\models\User;

class CreateController extends Controller {
    public $defaultAction = 'create-client';

    public function actionCreateClientStart () {
        return $this->renderAjax('createOptions');
    }

    static function getPhone ($profile) {
       $potens = ['phone_work', 'phone_private', 'mobile']; 

       foreach ($potens as $option) {
           if (isset($profile->$option)) {
               return $option;
           }
       }

       return null;
    }

    public function actionCreateClientExisting () {
        $client = new Client();

        $selectedUser = Yii::$app->request->post('selected_user');
        if ($selectedUser != null) {
            $userGuid = explode(",", $selectedUser)[0];
            $userGuid = preg_replace("/[^A-Za-z0-9\-]/", '', $userGuid);

            if ($userGuid != "") {
                $user = User::findOne(['guid' => $userGuid]);

                if ($user != null) {
                    $client->firstname = $user->profile->firstname;
                    $client->lastname = $user->profile->lastname;
                    $client->street_address = $user->profile->street;
                    $client->city = $user->profile->city;
                    $client->state = $user->profile->state;
                    $client->postal_code = $user->profile->zip;
                    $client->country = $user->profile->country;
                    $client->email = $user->email;
                    $client->phone_number = self::getPhone($user->profile);

                    if ($client->validate()) {
                        $result = $client->createClient();
                        if (isset($result['success']) && $result['success']) {
                            return $this->htmlRedirect($client->space->getUrl());
                        } else {
                            return $this->actionProblem($result);
                        }
                    }
                }
            }

            $client->addError('firstname', 'Please select a valid user. Make sure the profile has first and last names, an address and a email');
        }

        return $this->renderAjax('clientExisting', ['client' => $client]);
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