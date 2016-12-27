<?php

namespace intelligen\modules\pcontent\widgets;

use Yii;

class WallEntry extends \humhub\modules\content\widgets\WallEntry
{

    public $editRoute = "/pcontent/content/edit";
    
    public function run()
    {
        //We don't want an edit menu when the poll is closed
        if(version_compare(Yii::$app->version, '1.0.0-beta.4', 'lt') || $this->contentObject->closed) {
            $this->editRoute = '';
        }

        return $this->render('entry', array('poll' => $this->contentObject,
                    'user' => $this->contentObject->content->user,
                    'contentContainer' => $this->contentObject->content->container));
    }

}