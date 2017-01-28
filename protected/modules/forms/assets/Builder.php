<?php

namespace intelligen\modules\forms\assets;

use yii\web\AssetBundle;

class Builder extends AssetBundle
{
    public $sourcePath = '@intelligen/modules/forms/assets/resources';

    public $css = [
        'vendor/ngFormBuilder.css'
    ];
    
    public $js = [
        'vendor/angular.js',
        'vendor/ngFormBuilder.js',
        'builder.js'
    ];
}
