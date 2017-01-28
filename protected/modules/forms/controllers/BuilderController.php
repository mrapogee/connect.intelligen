<?php

namespace intelligen\modules\forms\controllers;

use Yii;
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

    public function init() {
        $this->appendPageTitle(\Yii::t('DirectoryModule.base', 'Directory'));
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

        if ($form) {
            $form = Form::findOne($form);
        }

        if (!$form) {
            $form = new Form();
            $form->name = 'Untitled';
            $form->branches = ['base' => ['name' => 'Base', 'form' => ['display' => 'form']]];
            $form->latestBranch = 'base';
            $branch = 'base';
        }

        if (!$branch) {
            $branch = $form->latestBranch;
        }

        return $this->render('show', [
            'saveUrl' => Url::to(['/api/v1/forms']),
            'forms' => $forms,
            'branch' => $branch,
            'form' => $form
        ]);
    }

    public function actionSave () {
        $form = new Form();
        $form->load(Yii::$app->request->post(), '');

        if ($form->validate() && $form->save()) {
            return json_encode();
        }

        Yii::$app->response->setStatus(400);
        return [
            errors => $from->getErrors()
        ];
    }
}