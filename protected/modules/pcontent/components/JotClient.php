<?php

namespace intelligen\modules\pcontent\components;

use Yii;

class JotClient {
    /**
     * Private ctor so nobody else can instance it
     *
     */
    private function __construct()
    {

    }

    static function instance () {
        static $inst = null;
        if ($inst === null) {
            $inst = new JotClient();
        }
        return $inst;
    }

    public function makeUrl($endpoint) 
    {
        $endpoint = trim($endpoint, "/");
        return "http://api.jotform.com/$endpoint?apiKey=" . Yii::$app->params['jotApiKey'];
    }

    public function getForms() 
    {
        $url = $this->makeUrl('/user/forms');
        $response = \Httpful\Request::get($url)
            ->expectsJson()
            ->send();

        $forms = $response->body->content;
        $forms = array_filter($forms, function ($form) { return $form->status === 'ENABLED'; });
        
        usort($forms, function ($a, $b) { return $a->title <=> $b->title; });

        return $forms;
    }
}
