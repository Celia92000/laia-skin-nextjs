'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

type Point = { x: number; y: number };
type Area = { x: number; y: number; width: number; height: number };

interface MediaCropModalProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  contentType?: 'post' | 'reel' | 'story';
  onSave: (croppedImage: string) => void;
  onClose: () => void;
}

// Fonction pour créer l'image recadrée
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return canvas.toDataURL('image/jpeg', 0.95);
}

export default function MediaCropModal({
  mediaUrl,
  mediaType,
  contentType,
  onSave,
  onClose,
}: MediaCropModalProps) {
  // Déterminer le ratio par défaut selon le type de contenu
  const getDefaultAspectRatio = () => {
    if (contentType === 'reel' || contentType === 'story') {
      return 9 / 16; // Format vertical 9:16 pour les reels et stories
    }
    return 1; // Format carré 1:1 par défaut pour les posts
  };

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspectRatio, setAspectRatio] = useState(getDefaultAspectRatio());

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(
        mediaUrl,
        croppedAreaPixels,
        rotation
      );
      onSave(croppedImage);
      onClose();
    } catch (e) {
      console.error('Erreur lors du recadrage:', e);
    }
  };

  const aspectRatios = [
    { label: '1:1 Carré (Post Instagram)', value: 1 },
    { label: '4:5 Portrait (Post Instagram)', value: 4 / 5 },
    { label: '9:16 Vertical (Story/Reel)', value: 9 / 16 },
    { label: '16:9 Paysage (YouTube)', value: 16 / 9 },
    { label: 'Libre', value: null }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#8B6F5C]">
              ✂️ Recadrer le média
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Info dimensions recommandées */}
          {contentType && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {contentType === 'reel' && '📱 Reel Instagram : 1080x1920px (9:16 vertical)'}
                {contentType === 'story' && '📱 Story Instagram : 1080x1920px (9:16 vertical)'}
                {contentType === 'post' && '📸 Post Instagram : 1080x1080px (1:1 carré) ou 1080x1350px (4:5 portrait)'}
              </p>
              {croppedAreaPixels && (
                <p className="text-xs text-blue-600 mt-1">
                  ✂️ Zone sélectionnée : {Math.round(croppedAreaPixels.width)}x{Math.round(croppedAreaPixels.height)}px
                </p>
              )}
            </div>
          )}

          {/* Formats prédéfinis */}
          <div className="mb-4 flex flex-wrap gap-2">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio.value ?? 'free'}
                onClick={() => setAspectRatio(ratio.value ?? 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  aspectRatio === ratio.value
                    ? 'bg-[#8B6F5C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>

          {/* Zone de recadrage */}
          <div className="relative h-96 bg-black rounded-lg mb-4">
            <Cropper
              image={mediaUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              rotation={rotation}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Contrôles */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Zoom: {zoom.toFixed(1)}x
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8B6F5C]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 Rotation: {rotation}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8B6F5C]"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-[#8B6F5C] text-white rounded-lg hover:bg-[#9D8068] font-medium"
            >
              ✅ Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
