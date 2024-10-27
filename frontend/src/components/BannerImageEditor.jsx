import { useState } from "react";
import { Cropper } from "react-cropper";
import 'cropperjs/dist/cropper.css';

const BannerImageEditor = ({ image, onSave, onCancel }) => {
  const [cropper, setCropper] = useState(null);

  const handleSave = () => {
    if (cropper) {
      const croppedImage = cropper.getCroppedCanvas().toDataURL();
      onSave(croppedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">画像を編集</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* クロッパー */}
        <div className="mb-4">
          <Cropper
            src={image}
            style={{ height: 400, width: '100%' }}
            aspectRatio={3 / 1} // バナーのアスペクト比を設定
            guides={true}
            preview=".preview"
            onInitialized={(instance) => setCropper(instance)}
          />
        </div>

        {/* プレビュー */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">プレビュー</h3>
          <div 
            className="preview"
            style={{ 
              width: '100%',
              height: '120px',
              overflow: 'hidden',
              borderRadius: '8px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        {/* 操作ボタン */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerImageEditor;