<?php

use yii\helpers\Html;
use humhub\modules\space\modules\manage\widgets\MemberMenu;
use yii\widgets\ActiveForm;

?>


<div class="panel panel-default panel-space-walls">
    <div class="panel-heading">
        <?php echo Yii::t('SpaceModule.views_admin_members', '<strong>Manage</strong> members'); ?>
    </div>
    <?= MemberMenu::widget(['space' => $space]); ?>
    <div class="panel-body">
        <div class='header'>
            <h4>Walls</h4>
            <a href="<?= $space->createUrl('member/edit-wall') ?>" class="btn btn-primary" title="Create Wall"><i class="fa fa-plus"></i> Wall</a>
        </div>       
        <br>
        <table class="table table-hover">
            <thead>
                <th><strong>Wall Title</strong></th>
                <th><strong>Members</strong></th>
                <th><strong>Actions</strong></th>
            </thead>
            <tbody>
            <?php foreach ($walls as $wall): ?>
                <tr>
                    <td>
                    <?= $wall->title ?>
                    </td>
                    <td>
                    <?= isset($members[$wall->id]) ? implode(',', $members[$wall->id]) : '' ?>
                    </td>
                    <td>
                        <a href="<?= $space->createUrl('member/edit-wall', ['id' => $wall->id]) ?>" class="btn btn-primary btn-xs" title="Create Wall"><i class="fa fa-pencil"></i> </a>
                        <a href="<?= $space->createUrl('member/delete-wall', ['id' => $wall->id]) ?>" class="btn btn-danger btn-xs" title="Create Wall"><i class="fa fa-times"></i> </a>
                    </td>
                </tr>
            <?php endforeach; ?> 
            </tbody>
       </table>
    </div>
</div>
