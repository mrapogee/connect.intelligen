<?php

namespace intelligen\modules\pcontent\components;

class ActivityStreamAction extends StreamAction 
{
    public function setupFilters()
    {
        parent::setupFilters();
        $this->filterContentType('activity');
    }
}