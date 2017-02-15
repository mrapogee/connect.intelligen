<?php

namespace intelligen\modules\actions\components;
use Yii;
use intelligen\modules\forms\models\FormRequest;

class WaggleClient {
  static function createUrl ($url) {
    $waggleKey = Yii::$app->params['waggleKey'];
    $waggleEndpoint = Yii::$app->params['waggleEndpoint'];
    return $waggleEndpoint . $url;
  }

  static function getProcess ($id) {
    $response = \Httpful\Request::get(self::createUrl("/proceses/$id"))
        ->expectsJson()
        ->send();

    return $response->body;
  }

  static function getProcesses ()  {
    $response = \Httpful\Request::get(self::createUrl("/processes"))
        ->expectsJson()
        ->send();

    return $response->body->data;
  }

  static function createProcessInstance ($id) {
    $body = [
      'processId' => $id
    ];

    $response = \Httpful\Request::post(self::createUrl("/instances"))
      ->sendsJson()
      ->body(json_encode($body))
      ->expectsJson()
      ->send();

    return $response->body;
  }

  static function getInstance ($id) {
    $response = \Httpful\Request::get(self::createurl("/instances/$id"))
        ->expectsJson()
        ->send();

    return $response->body;
  }

  static function patchInstance ($id, $patch)  {
    $response = \Httpful\Request::patch(self::createurl("/instances/$id"))
        ->sendsJson()
        ->body(json_encode($patch))
        ->expectsJson()
        ->send();

    return $response->body;
  }

  static function updateInstance ($id, $space) {
    $body = [
      'instanceId' => $id
    ];

    $response = \Httpful\Request::post(self::createUrl('/solves'))
      ->sendsJson()
      ->body(json_encode($body))
      ->expectsJson()
      ->send();

    $packages = $response->body;

    foreach ($packages as $package) {
      $formRequest = new FormRequest();
      $formRequest->items = json_encode($package->items);
      $formRequest->users = json_encode($package->recipients);
      $formRequest->instance_id = $id;
      $formRequest->content->container = $space;
      $formRequest->save();
    }
  }
}

?>