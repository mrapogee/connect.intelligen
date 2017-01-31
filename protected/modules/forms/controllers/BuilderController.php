<?php

namespace intelligen\modules\forms\controllers;

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
use intelligen\modules\forms\models\Form;
use yii\mongodb\Query;

/**
 * MailController provides messaging actions.
 *
 * @package humhub.modules.mail.controllers
 * @since 0.5
 */
class BuilderController extends Controller
{

    public $subLayout = "@intelligen/modules/forms/views/_layout";
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
        $forms = Form::find()->all();

        if ($form === 'new') {
            $form = new Form();
            $form->name = 'Untitled';
            $form->branches = [];
            $form->addBranch([
                'id' => 'base', 
                'name' => 'Base', 
                'form' => ['display' => 'form']
            ]);

            return $this->redirect(Url::to(['/forms/builder', 'form' => (string) $form->_id, 'branch' => $form->branches[0]['id']]));
        } 

        if ($branch === 'new') {
            $form = Form::findOne($form);
            if ($form) {
                $id = $this->sec->generateRandomString(22);
                $form->addBranch([
                    'id' => $id,
                    'name' => 'New Version',
                    'form' => $form->branches[count($form->branches) - 1]['form']
                ]);

                return $this->redirect(Url::to(['/forms/builder', 'form' => (string) $form->_id, 'branch' => $id]));
            }
        } 

        if ($form) {
            $form = Form::findOne($form);
        }

        if ($form && !$branch) {
            $branch = $form->branches[count($form->branches) - 1]['id'];
        }

        return $this->render('show', [
            'saveUrl' => Url::to(['/api/v1/forms']),
            'forms' => $forms,
            'branch' => $branch,
            'form' => $form
        ]);
    }
}