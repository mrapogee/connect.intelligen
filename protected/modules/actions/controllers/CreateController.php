<?php

namespace intelligen\modules\actions\controllers;

use Yii;
use humhub\components\Controller;
use intelligen\modules\actions\components\WaggleClient;
use humhub\modules\space\models\Space;
use intelligen\modules\actions\models\CreateProcess;

class CreateController extends Controller {
  public function actionCreate () {
    $procs = WaggleClient::getProcesses();
    $process = new CreateProcess();

    $post = Yii::$app->request->post();
    if ($process->load(Yii::$app->request->post())) {
      if ($process->validate() && $process->save()) {
        return $this->htmlRedirect($process->space->getUrl());
      }
    }


    foreach ($procs as $proc) {
      $out[$proc->_id] = $proc->name;
    }


    return $this->renderAjax('show', [
      'processes' => $out,
      'model' => $process
    ]);
  }
}
