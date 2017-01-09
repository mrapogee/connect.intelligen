<?php

return [
    'bootstrap' => ['debug'],
	'modules' => [
	    'debug' => [
	        'class' => 'yii\debug\Module',
	        'allowedIPs' => ['127.0.0.1', '::1', '75.136.77.25'],
	    ],
	],

	'timeZone' => 'America/New_York'
];
