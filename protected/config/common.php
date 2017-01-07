<?php

return [
    'components' => [
		'urlManager' => [
			'enablePrettyUrl' => true,
			'showScriptName' => false,
            'enableStrictParsing' => false,
			'rules' => [
                ['class' => 'yii\rest\UrlRule', 'controller' => ['api/v1/activities' => 'pcontent/activity']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['api/v1/forms' => 'pcontent/form']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['api/v1/message' => 'pcontent/message']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['api/v1/profile' => 'pcontent/profile']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['api/v1/client' => 'pcontent/client']],
				'<controller:\w+>/<action:\w+>' => '<controller>/<action>',
			]
		]
	]
];
