<?php

namespace intelligen\modules\egnyte;

use intelligen\modules\pcontent\models\Content;
use humhub\modules\space\models\Space;
use humhub\modules\content\components\ContentContainerModule;
use humhub\modules\content\components\ContentContainerActiveRecord;
use intelligen\modules\pcontent\permissions\ModifyProfiles;
use intelligen\modules\pcontent\permissions\ResetPassword;

class Module extends ContentContainerModule {
    /**
     * @inheritdoc
     */
    public function getContentContainerTypes()
    {
        return [
            Space::className(),
        ];
    }

    /**
     * @inheritdoc
     */
    public function disable()
    {
        parent::disable();
    }

    /**
     * @inheritdoc
     */
    public function disableContentContainer(ContentContainerActiveRecord $container)
    {
        parent::disableContentContainer($container);
    }

    /**
     * @inheritdoc
     */
    public function getPermissions($contentContainer = null)
    {
        return [];
    }

    /**
     * @inheritdoc
     */
    public function getContentContainerName(ContentContainerActiveRecord $container)
    {
        return 'Egnyte';
    }

    /**
     * @inheritdoc
     */
    public function getContentContainerDescription(ContentContainerActiveRecord $container)
    {
        return 'Allows file storage from egnyte.';
    }
}
