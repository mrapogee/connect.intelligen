<?php

namespace intelligen\modules\pcontent\widgets;

use Yii;
use yii\db\Query;

class WallEntry extends \humhub\modules\content\widgets\WallEntry
{
    const TEMPLATES = [
        'form' => 'formEntry',
        'activity' => 'activityEntry',
        'message' => 'messageEntry',
    ];

    public $editRoute = "/pcontent/content/edit";
    
    public function run()
    {
        $content = $this->contentObject;
        $data = json_decode($content->value);

        if (isset(self::TEMPLATES[$content->type])) {
            $template = self::TEMPLATES[$content->type];
        } else {
            $template = 'errorEntry';
        }
        
        return $this->render($template, [
            'content' => $content,
            'data' => $data,
            'user' => $this->contentObject->content->user,
            'space' => $this->contentObject->content->container
        ]);
    }

}