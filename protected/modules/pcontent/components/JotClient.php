<?php

namespace intelligen\modules\pcontent\components;

use Yii;

class JotClient {
    /**
     * Private ctor so nobody else can instance it
     *
     */

    const ADDRESS_MAPPINGS = [
        'street name' => 'street_name',
        'house number' => 'street_number',
        'city' => 'city',
        'state' => 'state',
        'postal code' => 'postal',
        'country' => 'country'
    ];
     
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

    public static function parseAddress (string $addressString) {
        $addressParts = preg_split("/\n/", $addressString);

        $address = [];
        foreach ($addressParts as $part) {
            list( $key, $value ) = explode(':', $part);
            $key = trim(strtolower($key));
            $value = trim($value);

            // Set value
            if (isset(self::ADDRESS_MAPPINGS[$key])) {
                $address[self::ADDRESS_MAPPINGS[$key]] = $value;
            }
        }

        if (isset($address['street_name']) && isset($address['street_number'])) {
            $address['street_address'] = "$address[street_number] $address[street_name]";
        }

        return $address;
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
