<?php

namespace intelligen\modules\egnyte\controllers;

use humhub\modules\content\components\ContentContainerController;

class FoldersController extends ContentContainerController {
    function actionIndex () {
        return $this->render('index');
    }
}
