<?php

namespace intelligen\modules\pcontent\components;

class MessageStreamAction extends StreamAction 
{
    public function setupFilters()
    {
        parent::setupFilters();
        $this->filterContentType('message');
    }
}