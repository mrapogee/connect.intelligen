<?php

namespace intelligen\modules\pcontent\permissions;

use humhub\modules\space\models\Space;

/**
 * CreateContent Permission
 */
class CreateContent extends \humhub\libs\BasePermission
{

    /**
     * @inheritdoc
     */
    public $defaultAllowedGroups = [
        Space::USERGROUP_OWNER,
        Space::USERGROUP_ADMIN,
        Space::USERGROUP_MODERATOR,
        Space::USERGROUP_MEMBER,
    ];
    
    /**
     * @inheritdoc
     */
    protected $fixedGroups = [
        Space::USERGROUP_USER
    ];

    /**
     * @inheritdoc
     */
    protected $title = "Create poll";

    /**
     * @inheritdoc
     */
    protected $description = "Allows the user to create polls";

    /**
     * @inheritdoc
     */
    protected $moduleId = 'polls';

}
