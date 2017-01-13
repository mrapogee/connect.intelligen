<?php

/**
 * @link https://www.humhub.org/
 * @copyright Copyright (c) 2016 HumHub GmbH & Co. KG
 * @license https://www.humhub.com/licences
 */

namespace intelligen\modules\pcontent\widgets;

/**
 * This widget is used include the post form.
 * It normally should be placed above a steam.
 *
 * @since 0.5
 */
class FormForm extends \humhub\modules\content\widgets\WallCreateContentForm
{

    public $contentContainer;
    public $form;
    public $forms;

    /**
     * @inheritdoc
     */
    public $submitUrl = '/pcontent/content/post-form';

    /**
     * @inheritdoc
     */
    public function renderForm()
    {
        return $this->render('formForm', [
            'contentContainer' => $this->contentContainer,
            'form' => $this->form,
            'forms' => $this->forms,
        ]);
    }

    /**
     * @inheritdoc
     */
    public function run()
    {
        return parent::run();
    }

}

?>