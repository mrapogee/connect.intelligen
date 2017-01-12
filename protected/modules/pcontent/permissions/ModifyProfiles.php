<?php

/**
 * @link https://www.humhub.org/
 * @copyright Copyright (c) 2015 HumHub GmbH & Co. KG
 * @license https://www.humhub.com/licences
 */

namespace intelligen\modules\pcontent\permissions;

/**
 * CreatePrivateSpace Permission
 */
class ModifyProfiles extends \humhub\libs\BasePermission
{

    /**
     * @inheritdoc
     */
    protected $id = 'modify_other_profiles';
    
    /**
     * @inheritdoc
     */
    protected $title = 'Modify the profiles of users';

    /**
     * @inheritdoc
     */
    protected $description = "Modify the profiles of clients when they are a part of the client's space";

    /**
     * @inheritdoc
     */
    protected $moduleId = 'pcontent';

    /**
     * @inheritdoc
     */
    protected $defaultState = self::STATE_DENY;
}
