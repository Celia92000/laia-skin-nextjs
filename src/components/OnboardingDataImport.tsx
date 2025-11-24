'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

type ImportType = 'clients' | 'services' | 'products';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingDataImport({ onComplete, onSkip }: Props) {
  const [importType, setImportType] = useState<ImportType>('clients');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [hasImported, setHasImported] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'csv') {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast.error('Utilisez un fichier CSV');
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', importType);

      const response = await fetch('/api/admin/data-import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'import');
      }

      const data: ImportResult = await response.json();
      setResult(data);
      setHasImported(true);

      if (data.success && data.imported > 0) {
        toast.success(`${data.imported} ${importType} importés !`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templates = {
      clients: '/templates/template-clients.csv',
      services: '/templates/template-services.csv',
      products: '/templates/template-products.csv',
    };

    const link = document.createElement('a');
    link.href = templates[importType];
    link.download = `template-${importType}.csv`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📥</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Importez vos données existantes
        </h2>
        <p className="text-gray-600">
          Gagnez du temps ! Importez vos clients, services et produits depuis un fichier CSV
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 text-xl">💡</div>
          <div className="text-sm text-blue-800">
            <strong>Astuce :</strong> Vous pouvez passer cette étape et y revenir plus tard dans
            <strong> Paramètres → Import de données</strong>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4">1. Choisir le type de données</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setImportType('clients')}
            className={`p-4 rounded-lg border-2 transition-all ${
              importType === 'clients'
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="font-semibold text-sm">Clients</div>
          </button>

          <button
            onClick={() => setImportType('services')}
            className={`p-4 rounded-lg border-2 transition-all ${
              importType === 'services'
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">💅</div>
            <div className="font-semibold text-sm">Services</div>
          </button>

          <button
            onClick={() => setImportType('products')}
            className={`p-4 rounded-lg border-2 transition-all ${
              importType === 'products'
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">🛍️</div>
            <div className="font-semibold text-sm">Produits</div>
          </button>
        </div>

        <button
          onClick={downloadTemplate}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          📥 Télécharger le template {importType}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4">2. Uploader votre fichier CSV</h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {!file ? (
            <div>
              <div className="text-4xl mb-3">📄</div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-rose-500 font-semibold hover:text-rose-600">
                  Sélectionner un fichier
                </span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Format CSV uniquement</p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">✅</div>
              <div className="font-semibold text-gray-900">{file.name}</div>
              <button
                onClick={() => setFile(null)}
                className="mt-3 text-red-500 hover:text-red-600 text-sm"
              >
                Changer
              </button>
            </div>
          )}
        </div>
      </div>

      {file && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={handleImport}
            disabled={importing}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              importing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {importing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Import en cours...
              </span>
            ) : (
              '🚀 Lancer l\'import'
            )}
          </button>

          {result && (
            <div className={`mt-4 p-4 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
            }`}>
              <div className="font-semibold mb-2">
                {result.success ? '✅ Import terminé' : '⚠️ Import partiellement réussi'}
              </div>
              <div className="text-sm space-y-1">
                <div>✅ Importés : {result.imported}</div>
                {result.failed > 0 && <div>❌ Échecs : {result.failed}</div>}
              </div>
              {result.errors.length > 0 && (
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer font-semibold">Voir les erreurs</summary>
                  <ul className="mt-2 space-y-1">
                    {result.errors.slice(0, 5).map((error, i) => (
                      <li key={i} className="text-red-700">• {error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between gap-4">
        <button
          onClick={onSkip}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
        >
          ⏭️ Passer cette étape
        </button>

        <button
          onClick={onComplete}
          disabled={!hasImported}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            hasImported
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {hasImported ? '✅ Terminer' : '⏭️ Importer d\'abord'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Vous pourrez importer plus de données plus tard dans les paramètres
        </p>
      </div>
    </div>
  );
}
