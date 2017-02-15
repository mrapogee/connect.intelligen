<?php

namespace intelligen\modules\actions\controllers;

use Yii;
use yii\base\Security;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\web\HttpException;
use humhub\components\Controller;
use humhub\modules\file\models\File;
use humhub\modules\mail\models\Message;
use humhub\modules\mail\models\MessageEntry;
use humhub\modules\mail\models\UserMessage;
use humhub\modules\User\models\User;
use humhub\modules\mail\models\forms\InviteRecipient;
use humhub\modules\mail\models\forms\ReplyMessage;
use humhub\modules\mail\models\forms\CreateMessage;
use humhub\modules\mail\permissions\SendMail;
use humhub\modules\user\widgets\UserPicker;
use yii\mongodb\Query;

/**
 * MailController provides messaging actions.
 *
 * @package humhub.modules.mail.controllers
 * @since 0.5
 */
class BuilderController extends Controller
{

    public $subLayout = "@intelligen/modules/actions/views/_layout";
    public $sec;

    public function init() {
        $this->appendPageTitle(\Yii::t('DirectoryModule.base', 'Directory'));
        $this->sec = new Security();
        return parent::init();
    }

    /**
     * @inheritdosc
     */
    public function behaviors()
    {
        return [
            'acl' => [
                'class' => \humhub\components\behaviors\AccessControl::className(),
                'guestAllowedActions' => ['groups', 'index', 'members', 'spaces', 'user-posts', 'stream']
            ]
        ];
    }

    public function actionIndex ($form = null, $branch = null) {
        return $this->render('show', [
        ]);
    }
}