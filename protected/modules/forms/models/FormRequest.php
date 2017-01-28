<?php

namespace intelligen\modules\forms\models;

use Yii;
use humhub\modules\content\components\ContentActiveRecord;
use humhub\modules\search\interfaces\Searchable;
use humhub\modules\user\models\GroupUser;
use humhub\modules\content\models\WallEntry;
use humhub\modules\content\models\Wall;
use humhub\modules\user\models\User;
use humhub\modules\space\models\Space;

class FormRequest extends ContentActiveRecord {
    const SCENARIO_DEFAULT = 'default';

    public $wallEntryClass = 'intelligen\modules\forms\widgets\WallEntry';

    public static function tableName()
    {
        return 'form_request';
    }

    public function getForm () {
        $form = Form::findOne($this->form_id);

        if (!$form) {
            return null;
        }

        return [
            'id' => $this->id,
            'name' => $form->name,
            'form' => $form->branches[$this->branch_id]['form']
        ];
    }

    public function getSubmission () {
        if (!$this->submission_id) {
            return null;
        }

        $sub = FormSubmission::findOne($this->submission_id);

        if (!$sub) {
            return null;
        }

        return $sub->value;
    }

    public function submit ($data) {
        $sub = !$this->submission_id 
            ? new FormSubmission() 
            : FormSubmission::findOne($this->submission_id);

        if (!$sub) {
            $sub = new FormSubmission();
        }

        $sub->value = $data;
        $sub->formId = $this->form_id;
        $sub->branchId = $this->branch_id;

        $sub->save();

        $subId = (string) $sub->_id;
        if ($this->submission_id !== $subId) {
            $this->submission_id = $subId;
            $this->save();
        }
    }

    /**
     * @inheritdoc
     */
    public function getContentName()
    {
        return 'Form';
    }

    public function scenarios()
    {
        return [
            self::SCENARIO_DEFAULT => ['submission_id', 'form_id', 'branch_id', 'note', 'id']
        ];
    }
}
