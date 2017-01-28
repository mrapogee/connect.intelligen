<?php

return [
    'bootstrap' => ['debug'],
	'modules' => [
	    'debug' => [
	        'class' => 'yii\debug\Module',
	        'allowedIPs' => ['127.0.0.1', '::1', '75.136.77.25'],
	    ],
	],

	'timeZone' => 'America/New_York',

'components' => [
		'urlManager' => [
			'enablePrettyUrl' => true,
			'showScriptName' => false,
			'enableStrictParsing' => false,
			'rules' => [
				'PUT,PATCH /api/v1/forms/<id>' => 'forms/form/update',
				'PUT,PATCH /api/v1/forms/<id>/branch/<branch>' => 'forms/form/update-branch',
				'PUT,PATCH,POST /api/v1/submission' => 'forms/form/submit',
				'DELETE /api/v1/forms/<id>' => 'forms/form/delete',
				'GET,HEAD /api/v1/forms/<id>' => 'forms/form/view',
				'POST /api/v1/forms' => 'forms/form/create',
				'GET,HEAD /api/v1/forms' => 'forms/form/index',
				'/api/v1/forms/<id>' => 'forms/form/options',
				'<controller:\w+>/<action:\w+>' => '<controller>/<action>',
			]
		],
		'request' => [
			'parsers' => [
				'application/json' => 'yii\web\JsonParser',
			]
		]
	]
];
