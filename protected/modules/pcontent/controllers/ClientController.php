<?php

namespace intelligen\modules\pcontent\controllers;
use intelligen\modules\pcontent\components;

class ClientController extends RestController {
    function actions () {
        return [
            'create' => [
                'class' => components\CreateClientAction::className()
            ]
        ];
    }
}
