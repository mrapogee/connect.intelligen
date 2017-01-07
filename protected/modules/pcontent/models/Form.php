<?php

namespace intelligen\modules\pcontent\models;

class Form extends Content {
    public function load ($data, $formName = '') {
        $value = $formName === '' ? $data : $data[$formName];

        return $this->loadType('form', $value);
    }
}
