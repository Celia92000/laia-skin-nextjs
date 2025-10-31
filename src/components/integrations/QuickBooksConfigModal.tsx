'use client';

import { X, FileText } from 'lucide-react';

interface QuickBooksConfigModalProps {
  onClose: () => void;
}

export default function QuickBooksConfigModal({ onClose }: QuickBooksConfigModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">QuickBooks</h3>
              <p className="text-sm text-gray-500">Comptabilité</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900">
            🚧 <strong>Intégration en développement</strong>
          </p>
          <p className="text-sm text-blue-800 mt-2">
            Cette intégration sera disponible prochainement. Elle permettra de synchroniser votre comptabilité QuickBooks avec LAIA.
          </p>
        </div>

        <button onClick={onClose} className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
          Fermer
        </button>
      </div>
    </div>
  );
}
