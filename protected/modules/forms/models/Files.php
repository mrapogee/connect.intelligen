<?

namespace intelligen\modules\forms\models;

use yii\base\Model;
use yii\web\UploadedFile;

class UploadForm extends Model
{
    /**
     * @var UploadedFile[]
     */
    public $imageFiles;

    public function rules()
    {
        return [
            [['fiels'], 'file', 'skipOnEmpty' => false, 'maxFiles' => 8],
        ];
    }
    
    public function upload()
    {
        if ($this->validate()) { 
            foreach ($this->imageFiles as $file) {
                $file->saveAs('uploads/' . $file->baseName . '.' . $file->extension);
            }
            return true;
        } else {
            return false;
        }
    }
}