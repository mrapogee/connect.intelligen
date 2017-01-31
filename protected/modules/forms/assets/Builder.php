<?php

namespace intelligen\modules\forms\assets;

use yii\web\AssetBundle;

class Builder extends AssetBundle
{
    public $sourcePath = '@intelligen/modules/forms/assets/resources';

    public $css = [
        'vendor/font-awesome.css',
        'vendor/font-awesome-463.css',
        'vendor/ui-bootstrap.css',
        'vendor/ui-select.css',
        'vendor/ng-dialog.css',
        'vendor/ng-ckeditor.css',
        'vendor/ngFormio.css',
        'vendor/ngFormBuilder.css',
        'fix.css'
    ];

    public $js = [
        'vendor/angular.js',
        'vendor/lodash.js',
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
        'vendor/angular-dnd-lists.js',
        'vendor/ng-dialog.js',
        'vendor/ng-ckeditor.js',
        'vendor/ng-file-upload.js',
        'vendor/ngFormBuilder.js',
        'vendor/ngFormio.js',
        'builder.js'
    ];
}
