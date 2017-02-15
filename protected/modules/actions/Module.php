<?php

namespace intelligen\modules\actions;
use humhub\modules\content\components\ContentContainerModule;
use humhub\modules\space\models\Space;
use humhub\modules\content\components\ContentContainerActiveRecord;



class Module extends ContentContainerModule {
    public function getContentContainerTypes ()
    {
        return [
            Space::className()
        ];
    }

    /**
     * @inheritdoc
     */
    public function getContentContainerName(ContentContainerActiveRecord $container)
    {
        return 'Actions';
    }

    /**
     * @inheritdoc
     */
    public function getContentContainerDescription(ContentContainerActiveRecord $container)
    {
        return '';
    }

    public function getPermissions($contentContainer = null)
    {
        /*if ($contentContainer instanceof \humhub\modules\space\models\Space) {
            return [
                new permissions\CreateContent()
            ];
        }*/

        return [
        ];
    }
}