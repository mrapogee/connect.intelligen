<?php

namespace intelligen\modules\pcontent;

use intelligen\modules\pcontent\models\Content;
use humhub\modules\space\models\Space;
use humhub\modules\content\components\ContentContainerModule;
use humhub\modules\content\components\ContentContainerActiveRecord;

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
        if ($contentContainer instanceof \humhub\modules\space\models\Space) {
            return [
                new permissions\CreateContent()
            ];
        }

        return [];
    }

    /**
     * @inheritdoc
     */
    public function getContentContainerName(ContentContainerActiveRecord $container)
    {
        return 'Content';
    }

    /**
     * @inheritdoc
     */
    public function getContentContainerDescription(ContentContainerActiveRecord $container)
    {
        return 'Allows powerful content';
    }
}
