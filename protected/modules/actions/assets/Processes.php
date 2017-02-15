<?php

namespace intelligen\modules\actions\assets;

use yii\web\AssetBundle;

class Processes extends AssetBundle
{
    public $sourcePath = '@intelligen/modules/actions/assets/resources';

    public $css = [
      'static/css/app.css'
    ];

    public $js = [
      'static/js/manifest.js',
      'static/js/vendor.js',
      'static/js/app.js',
      'process.js'
    ];
}
