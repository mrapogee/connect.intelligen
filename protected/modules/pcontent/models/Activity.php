<?php

namespace intelligen\modules\pcontent\models;

class Activity extends Content {
    public function load ($data, $formName = '') {
        $value = $formName === '' ? $data : $data[$formName];

        return $this->loadType('activity', $value);
    }
}
