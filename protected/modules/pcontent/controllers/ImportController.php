<?php 

namespace intelligen\modules\pcontent\controllers;

use Yii;
use intelligen\modules\pcontent\models\Client;
use humhub\modules\user\models\User;

class ImportController extends RestController {
    function actions () {
        return [];
    }

    static function getPhone ($importRow) {
       $potens = ['phone_work', 'phone_private', 'mobile']; 

       foreach ($potens as $option) {
           if (isset($importRow[$option])) {
               return $option;
           }
       }

       return null;
    }

    function actionBulk () {
        $bulk = Yii::$app->getRequest()->getBodyParams();
        $admin = User::findOne(Yii::$app->params['adminID']);
        Yii::$app->user->switchIdentity($admin);
        $count = 0;
        foreach ($bulk as $row) {
            $row['country'] = strtolower($row['country']) === 'united states' ? 'US' : $row['country'];

            $client = new Client();

            $client->firstname = $row['firstname'];
            $client->lastname = $row['lastname'];
            $client->street_address = $row['street'];
            $client->city = $row['city'];
            $client->state = $row['state'];
            $client->postal_code = $row['zip'];
            $client->email = $row['email'];
            $client->phone_number = self::getPhone($row);

            $agent = $admin;
            $client->agent_email = $agent->email;

            $client->notifications = false;
            $client->createSpace = false;

            if (!$client->validate()) {
                return ['errors' => $client->getErrors(), 'row' => $row];
            }

            $client->createClient();

            $user = $client->clientUser;
            if ($user->clientUser == null) {
                $count++;
                continue;
            }
            $profile = $user->profile;


            $row['email'] = null;

            foreach ($row as $key => $value) {
                if ($key === 'email' || $key === 'created_on') {
                    continue;
                }
                $profile->$key = $value;
            }

            if (!$profile->validate()) {
                return ['errors' => $profile->getErrors(), 'row' => $row];
            }

            $profile->update();
        }

        return ['success' => true, 'count' => $count];
    }
}