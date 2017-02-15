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
use intelligen\modules\actions\components\WaggleClient;

class FormRequest extends ContentActiveRecord {
    const SCENARIO_DEFAULT = 'default';

    public $wallEntryClass = 'intelligen\modules\forms\widgets\WallEntry';
    public $autoAddToWall = false;

    public static function tableName()
    {
        return 'form_request';
    }

    public function afterSave($insert, $changedAttributes) {
        parent::afterSave($insert, $changedAttributes);

        if ($insert) {
            $users = json_decode($this->users);
            foreach ($users as $user) {
                $wall = Wall::findOne(['user_id' => $user, 'object_id' => $this->content->container->id]);
                if ($wall != null) {
                    $this->content->addToWall($wall->id);
                }
            }
        }
    }

    public function getItems () {
        $items = json_decode($this->items);

        return array_map(function ($item) { return $this->getItem($item); }, $items);
    }

    public function getItem_form ($item) {
        $item->branchId = isset($item->branchId) ? $item->branchId : null;
        $item->submissionId= isset($item->submissionId) ? $item->submissionId : null;

        $item->itemValue = $this->getForm($item->formId, $item->branchId, $item->submissionId);
        return $item;
    }

    public function getItem_submission ($item) {
        $submission = FormSubmission::findOne($item->submissionId);

        $item->formId = $submission->formId;
        $item->itemValue = $this->getForm($submission->formId, $submission->branchId, $item->submissionId);
        return $item;
    }

    public function getItem_approve ($item) {
        $submission = FormSubmission::findOne($item->submissionId);

        $item->formId = $submission->formId;
        $item->itemValue = $this->getForm($submission->formId, $submission->branchId, $item->submissionId);
        return $item;
    }

    public function getItem ($item) {
        $itemType = 'getItem_' . $item->type;
        return $this->$itemType($item);
    }

    public function updateItem_form ($index, $item, $data) {
        if (isset($item->submissionId)) {
            $submission = FormSubmission::findOne($item->submissionId);
            $submission->value = $data['value'];
        } else {
            $submission = new FormSubmission();
            $submission->processAttributes = [
                'instanceId' => $this->instance_id,
                'threadId' => $item->threadId
            ];
            $submission->value = $data['value'];
            $submission->formId = $data['formId'];
            $submission->branchId = $data['branchId'];

            $item->branchId = $data['branchId'];
        }

        $submission->submittedBy = Yii::$app->user->getIdentity()->guid;
        $submission->save();
        $item->submissionId = (string) $submission->_id;

        return $item;
    }

    public function updateItem_approve ($index, $item, $data) {
        if (isset($item->approved)) {
            $submission = FormSubmission::findOne($item->approved);
        } else {
            $submission = new FormSubmission();
            $submission->processAttributes = [
                'instanceId' => $this->instance_id,
                'threadId' => $item->threadId
            ];
            $submission->value = $data['value'];
        }

        $submission->submittedBy = Yii::$app->user->getIdentity()->guid;
        $submission->save();
        $item->approved = (string) $submission->_id;

        return $item;
    }

    public function updateItem_submission ($index, $item, $data) {

    }

    public function updateItem ($index, $data) {
        $item = json_decode($this->items)[$index];
        $itemType = 'updateItem_' . $item->type;
        $items = json_decode($this->items);
        $items[$index] = $this->$itemType($index, $item, $data);
        $this->items = json_encode($items);

        if ($this->instance_id) {
            WaggleClient::updateInstance($this->instance_id, $this->content->container);
        }

        $this->save();
    }

    public function getForm ($id, $branch = null, $submissionId = null) {
        $form = Form::findOne($id);

        if ($branch == null) {
            $branch = $form->published;
        }

        if (!$form) {
            return null;
        }

        $submission = null;
        $user = null;
        if ($submissionId != null) {
            $subModel = FormSubmission::findOne($submissionId);
            $submission = $subModel->value;
            $user = User::findByGuid($subModel->submittedBy);
        }

        return [
            'id' => $this->id,
            'name' => $form->name,
            'form' => $form->getBranch($branch)['form'],
            'branch' => $branch,
            'submission' => $submission,
            'user' => $user
        ];
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

        return $sub;
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
            self::SCENARIO_DEFAULT => ['items', 'users', 'instance_id', 'note', 'id']
        ];
    }
}
