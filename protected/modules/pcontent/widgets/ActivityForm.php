<?php

/**
 * @link https://www.humhub.org/
 * @copyright Copyright (c) 2016 HumHub GmbH & Co. KG
 * @license https://www.humhub.com/licences
 */

namespace intelligen\modules\pcontent\widgets;

/**
 * This widget is used include the post form.
 * It normally should be placed above a steam.
 *
 * @since 0.5
 */
class ActivityForm extends \humhub\modules\content\widgets\WallCreateContentForm
{

    public $contentContainer;
    public $activityType;
    public $activity;

    /**
     * @inheritdoc
     */
    public $submitUrl = '/pcontent/content/post-activity';

    /**
     * @inheritdoc
     */
    public function renderForm()
    {
        return $this->render('activityForm', [
            'contentContainer' => $this->contentContainer,
            'activityType' => $this->activityType,
            'activity' => $this->activity,
        ]);
    }

    /**
     * @inheritdoc
     */
    public function run()
    {
        return parent::run();
    }

}

?>