<?php

namespace intelligen\modules\forms\assets;

use yii\web\AssetBundle;

class Form extends AssetBundle
{
    public $sourcePath = '@intelligen/modules/forms/assets/resources';

    public $css = [
        'vendor/ui-bootstrap.css',
        'vendor/ui-select.css',
        'vendor/ngFormio.css',
    ];

    public $js = [
        'vendor/angular.js',
        'vendor/angular-file-saver.js',
        'vendor/moment.js',
        'vendor/angular-moment.js',
        'vendor/angular-sanitize.js',
        'vendor/signature-pad.js',
        'vendor/ui-bootstrap.js',
        'vendor/ui-bootstrap-templates.js',
        'vendor/ui-bootstrap-timepicker.js',
        'vendor/ui-bootstrap-timepicker-templates.js',
        'vendor/ui-mask.js',
        'vendor/ui-select.js',
        'vendor/ng-file-upload.js',
        'vendor/ngFormio.js',
        'view.js'
    ];
}
