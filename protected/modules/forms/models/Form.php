<?php

namespace intelligen\modules\forms\models;

class Form extends \yii\mongodb\ActiveRecord {
    const SCENARIO_DEFAULT = 'default';

    public function fields () {
        return ['id' => '_id', 'name' => 'name', 'branches' => 'branches', 'published' => 'published'];
    }

    public function attributes()
    {
        return ['_id', 'name', 'branches', 'published'];
    }

    public function scenarios()
    {
        return [
            self::SCENARIO_DEFAULT => ['name', 'branches', 'published']
        ];
    }    

    public static function collectionName()
    {
        return 'forms';
    }

    public function getBranch ($branchId) {
        foreach ($this->branches as $branch) {
            if ($branch['id'] === $branchId) {
                return $branch;
            }
        }

        return null;
    }

    public function updateBranch($branchId, $newValue) {
        $branches = $this->branches;
        foreach ($branches as $index => $branch) {
            if ($branch['id'] === $branchId) {
                $branches[$index] = $newValue;
                $this->branches = $branches;
                $this->save();
                return;
            }
        }

    }

    public function addBranch($branch) {
        $branches = $this->branches;
        array_push($branches, $branch);

        $this->branches = $branches;
        $this->save();
    }

    public function removeBranch($branchId) {
        $branches = $this->branches;
        foreach ($branches as $index => $branch) {
            if ($branch['id'] === $branchId) {
                unset($branches[$index]);
            }
        }

        $this->branches = $branches;
        $this->save();
    }

    public function rules()
    {
        return array();
    }
}
