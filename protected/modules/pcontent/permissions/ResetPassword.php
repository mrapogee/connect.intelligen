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
class ResetPassword extends \humhub\libs\BasePermission
{

    /**
     * @inheritdoc
     */
    protected $id = 'reset_other_password';
    
    /**
     * @inheritdoc
     */
    protected $title = 'Send password reset email to clients.';

    /**
     * @inheritdoc
     */
    protected $description = "Allows the user to send a rest email to clients if they are part of the client's space.";

    /**
     * @inheritdoc
     */
    protected $moduleId = 'pcontent';

    /**
     * @inheritdoc
     */
    protected $defaultState = self::STATE_DENY;
}
