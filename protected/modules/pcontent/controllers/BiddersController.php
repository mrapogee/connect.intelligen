<?php

namespace intelligen\modules\pcontent\controllers;

use humhub\modules\content\components\ContentContainerController;

class BiddersController extends ContentContainerController {
    function actionShow () {
        return $this->render('show', []);
    }
}