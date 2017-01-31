<?php

namespace intelligen\modules\forms;
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
        return 'Forms';
    }

    /**
     * @inheritdoc
     */
    public function getContentContainerDescription(ContentContainerActiveRecord $container)
    {
        return 'Allows forms to be used that have been built with the form builder.';
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