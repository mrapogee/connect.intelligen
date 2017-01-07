<?php

namespace intelligen\modules\pcontent\components;

class FormStreamAction extends StreamAction 
{
    public function setupFilters()
    {
        parent::setupFilters();
        $this->filterContentType('form');
    }
}