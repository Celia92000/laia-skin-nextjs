'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ChevronRight, ChevronLeft, Download, Upload, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

type ImportType = 'clients' | 'services' | 'products' | 'formations';
type WizardStep = 1 | 2 | 3 | 4 | 5;

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

interface PreviewRow {
  [key: string]: string;
}

interface Props {
  onComplete?: () => void;
  onSkip?: () => void;
  standalone?: boolean; // Si appelé depuis la config (pas l'onboarding)
}

export default function AssistedDataImport({ onComplete, onSkip, standalone = false }: Props) {
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [importType, setImportType] = useState<ImportType>('clients');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const importConfigs = {
    clients: {
      icon: '👥',
      title: 'Clients',
      description: 'Vos clients et leurs informations de contact',
      columns: ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'notes'],
      required: ['email'],
      example: {
        firstName: 'Sophie',
        lastName: 'Martin',
        email: 'sophie.martin@example.com',
        phone: '0612345678',
        address: '10 rue de la Paix',
        city: 'Paris',
        zipCode: '75001',
        notes: 'Cliente VIP'
      }
    },
    services: {
      icon: '💅',
      title: 'Services',
      description: 'Les prestations que vous proposez',
      columns: ['name', 'description', 'duration', 'price', 'category', 'active'],
      required: ['name', 'price'],
      example: {
        name: 'Soin du visage',
        description: 'Soin complet avec nettoyage et masque',
        duration: '60',
        price: '75',
        category: 'Soins du visage',
        active: 'true'
      }
    },
    products: {
      icon: '🛍️',
      title: 'Produits',
      description: 'Produits en vente dans votre institut',
      columns: ['name', 'description', 'price', 'stock', 'supplier', 'reference', 'active'],
      required: ['name', 'price'],
      example: {
        name: 'Crème hydratante',
        description: 'Crème pour peaux sèches 50ml',
        price: '29.90',
        stock: '25',
        supplier: 'L\'Oréal',
        reference: 'CREM-001',
        active: 'true'
      }
    },
    formations: {
      icon: '📚',
      title: 'Formations',
      description: 'Formations professionnelles que vous proposez',
      columns: ['name', 'description', 'price', 'duration', 'level', 'maxParticipants', 'certification', 'prerequisites', 'active'],
      required: ['name', 'price'],
      example: {
        name: 'Maquillage Semi-Permanent',
        description: 'Formation complète en maquillage semi-permanent',
        price: '1200',
        duration: '16',
        level: 'Débutant',
        maxParticipants: '8',
        certification: 'Certificat LAIA',
        prerequisites: 'Aucun',
        active: 'true'
      }
    },
    giftcards: {
      icon: '🎁',
      title: 'Cartes cadeaux',
      description: 'Cartes cadeaux vendues à vos clients',
      columns: ['code', 'initialAmount', 'remainingAmount', 'purchaseDate', 'expirationDate', 'buyerEmail', 'recipientName', 'recipientEmail', 'status', 'notes'],
      required: ['code', 'initialAmount'],
      example: {
        code: 'NOEL2024-001',
        initialAmount: '100',
        remainingAmount: '100',
        purchaseDate: '2024-12-01',
        expirationDate: '2025-12-01',
        buyerEmail: 'marie.dupont@test.com',
        recipientName: 'Sophie Martin',
        recipientEmail: 'sophie.martin@test.com',
        status: 'active',
        notes: 'Cadeau de Noël'
      }
    },
    packages: {
      icon: '📦',
      title: 'Forfaits',
      description: 'Forfaits et packages de services',
      columns: ['name', 'description', 'price', 'services', 'sessionsCount', 'validityDays', 'active'],
      required: ['name', 'price'],
      example: {
        name: 'Cure Minceur 5 séances',
        description: '5 séances de palper-rouler',
        price: '350',
        services: 'Palper-rouler;Enveloppement',
        sessionsCount: '5',
        validityDays: '90',
        active: 'true'
      }
    },
    promocodes: {
      icon: '🎟️',
      title: 'Codes promo',
      description: 'Codes de réduction pour vos clients',
      columns: ['code', 'type', 'value', 'startDate', 'endDate', 'maxUses', 'currentUses', 'minPurchase', 'services', 'active'],
      required: ['code', 'type', 'value'],
      example: {
        code: 'BIENVENUE10',
        type: 'percentage',
        value: '10',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        maxUses: '100',
        currentUses: '45',
        minPurchase: '0',
        services: '',
        active: 'true'
      }
    },
    reviews: {
      icon: '⭐',
      title: 'Avis clients',
      description: 'Avis et témoignages de vos clients',
      columns: ['clientName', 'clientEmail', 'rating', 'comment', 'date', 'service', 'validated', 'published', 'response'],
      required: ['clientName', 'rating', 'comment'],
      example: {
        clientName: 'Sophie Martin',
        clientEmail: 'sophie.martin@test.com',
        rating: '5',
        comment: 'Excellent soin du visage !',
        date: '2024-11-01',
        service: 'Soin du visage',
        validated: 'true',
        published: 'true',
        response: 'Merci Sophie !'
      }
    },
    newsletter: {
      icon: '📧',
      title: 'Abonnés newsletter',
      description: 'Contacts abonnés à votre newsletter',
      columns: ['email', 'firstName', 'lastName', 'subscriptionDate', 'source', 'status', 'tags', 'phone'],
      required: ['email'],
      example: {
        email: 'marie.dupont@test.com',
        firstName: 'Marie',
        lastName: 'Dupont',
        subscriptionDate: '2024-06-15',
        source: 'site-web',
        status: 'active',
        tags: 'VIP;Soins-visage',
        phone: '0612345678'
      }
    }
  };

  const config = importConfigs[importType];

  // Étape 1 : Choisir le type
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Que souhaitez-vous importer ?
        </h2>
        <p className="text-gray-600">
          Choisissez le type de données à importer depuis votre ancien système
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(Object.keys(importConfigs) as ImportType[]).map((type) => {
          const cfg = importConfigs[type];
          return (
            <button
              key={type}
              onClick={() => setImportType(type)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                importType === type
                  ? 'border-rose-500 bg-rose-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="text-4xl mb-3">{cfg.icon}</div>
              <div className="font-bold text-lg mb-1">{cfg.title}</div>
              <div className="text-sm text-gray-600">{cfg.description}</div>
            </button>
          );
        })}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex items-start gap-3">
          <HelpCircle className="text-blue-500 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <strong>Conseil :</strong> Commencez par importer vos <strong>services</strong>,
            puis vos <strong>clients</strong>, et enfin vos <strong>produits</strong>.
          </div>
        </div>
      </div>

      <button
        onClick={() => setWizardStep(2)}
        className="w-full py-4 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
      >
        Continuer <ChevronRight size={20} />
      </button>
    </div>
  );

  // Étape 2 : Télécharger le template
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">{config.icon}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Téléchargez le template {config.title}
        </h2>
        <p className="text-gray-600">
          Le template contient déjà les bonnes colonnes et des exemples
        </p>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-4">📋 Colonnes requises :</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {config.columns.map((col) => (
            <div key={col} className="flex items-center gap-2">
              <CheckCircle
                className={config.required.includes(col) ? 'text-rose-500' : 'text-gray-400'}
                size={18}
              />
              <span className="text-sm">
                <strong>{col}</strong>
                {config.required.includes(col) && (
                  <span className="text-rose-500 text-xs ml-1">*obligatoire</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-3">✨ Exemple de ligne :</h3>
        <div className="bg-white rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {config.columns.map(col => (
                  <th key={col} className="text-left px-2 py-1 border-b-2 border-gray-200">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {config.columns.map(col => (
                  <td key={col} className="px-2 py-2 text-gray-700">
                    {config.example[col as keyof typeof config.example] || ''}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => {
          const link = document.createElement('a');
          link.href = `/templates/template-${importType}.csv`;
          link.download = `template-${importType}.csv`;
          link.click();
          toast.success('Template téléchargé ! Ouvrez-le et remplissez vos données.');
          setTimeout(() => setWizardStep(3), 1000);
        }}
        className="w-full py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
      >
        <Download size={20} />
        Télécharger le template
      </button>

      <button
        onClick={() => setWizardStep(1)}
        className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
      >
        <ChevronLeft size={20} />
        Retour
      </button>
    </div>
  );

  // Étape 3 : Remplir le fichier
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">✏️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Remplissez votre fichier
        </h2>
        <p className="text-gray-600">
          Ouvrez le template et ajoutez vos données
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span>📝</span> Instructions étape par étape :
        </h3>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <strong>Ouvrez le fichier</strong> avec Excel, Google Sheets, ou LibreOffice
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <strong>Supprimez les exemples</strong> et ajoutez vos vraies données (une ligne par élément)
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <strong>Ne modifiez PAS les en-têtes</strong> (première ligne avec les noms de colonnes)
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <div>
              <strong>Sauvegardez en CSV</strong> (Fichier → Enregistrer sous → CSV)
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div className="text-sm text-yellow-900">
            <strong>Important :</strong> Assurez-vous que les champs obligatoires
            (<strong className="text-rose-600">{config.required.join(', ')}</strong>)
            sont bien remplis pour chaque ligne.
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setWizardStep(2)}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft size={20} />
          Retour
        </button>
        <button
          onClick={() => setWizardStep(4)}
          className="flex-1 py-4 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
        >
          Fichier rempli <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  // Étape 4 : Upload et prévisualisation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv') {
      toast.error('Veuillez utiliser un fichier CSV');
      return;
    }

    setFile(selectedFile);

    // Lire et prévisualiser
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(l => l.trim());

    if (lines.length < 2) {
      toast.error('Le fichier est vide');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/["']/g, ''));
    const preview: PreviewRow[] = [];

    for (let i = 1; i < Math.min(6, lines.length); i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/["']/g, ''));
      const row: PreviewRow = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      preview.push(row);
    }

    setPreviewData(preview);
    toast.success(`Fichier chargé ! ${lines.length - 1} lignes détectées.`);
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">📤</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Uploadez votre fichier
        </h2>
        <p className="text-gray-600">
          Nous allons vérifier vos données avant l'import
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
        {!file ? (
          <div>
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-rose-500 font-semibold hover:text-rose-600 text-lg">
                Cliquez pour sélectionner
              </span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">Format CSV uniquement</p>
          </div>
        ) : (
          <div>
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <div className="font-semibold text-lg text-gray-900 mb-1">{file.name}</div>
            <div className="text-sm text-gray-600 mb-4">
              {(file.size / 1024).toFixed(1)} KB • {previewData.length > 0 ? `${previewData.length}+ lignes` : ''}
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPreviewData([]);
              }}
              className="text-red-500 hover:text-red-600 text-sm font-semibold"
            >
              Changer de fichier
            </button>
          </div>
        )}
      </div>

      {previewData.length > 0 && (
        <div className="bg-white border-2 border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            Aperçu des données (5 premières lignes)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  {config.columns.map(col => (
                    <th key={col} className="text-left px-2 py-2 font-semibold">
                      {col}
                      {config.required.includes(col) && <span className="text-rose-500 ml-1">*</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    {config.columns.map(col => (
                      <td key={col} className={`px-2 py-2 ${
                        config.required.includes(col) && !row[col]
                          ? 'bg-red-50 text-red-700 font-semibold'
                          : 'text-gray-700'
                      }`}>
                        {row[col] || <span className="text-gray-400 italic">vide</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ✓ Les données semblent correctes
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => setWizardStep(3)}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft size={20} />
          Retour
        </button>
        <button
          onClick={() => setWizardStep(5)}
          disabled={!file}
          className={`flex-1 py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
            file
              ? 'bg-rose-500 hover:bg-rose-600'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Lancer l'import <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  // Étape 5 : Import et résultats
  const handleImport = async () => {
    if (!file) return;

    setImporting(true);

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

      if (data.success && data.imported > 0) {
        toast.success(`${data.imported} ${importType} importés avec succès !`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setImporting(false);
    }
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Import en cours...
        </h2>
        <p className="text-gray-600">
          Vérification et importation de vos données
        </p>
      </div>

      {!result && !importing && (
        <button
          onClick={handleImport}
          className="w-full py-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg"
        >
          🎯 Confirmer l'import
        </button>
      )}

      {importing && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <div className="font-semibold text-lg text-blue-900">
            Import en cours, veuillez patienter...
          </div>
          <div className="text-sm text-blue-700 mt-2">
            Cela peut prendre quelques secondes selon la taille du fichier
          </div>
        </div>
      )}

      {result && (
        <div className={`border-2 rounded-xl p-8 ${
          result.success
            ? 'bg-green-50 border-green-300'
            : 'bg-orange-50 border-orange-300'
        }`}>
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {result.success ? '🎉' : '⚠️'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {result.success ? 'Import terminé !' : 'Import partiellement réussi'}
            </h3>
          </div>

          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div className="bg-green-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-700">{result.imported}</div>
                <div className="text-sm text-green-600 font-semibold mt-1">Importés</div>
              </div>
              {result.failed > 0 && (
                <div className="bg-red-100 rounded-lg p-4">
                  <div className="text-3xl font-bold text-red-700">{result.failed}</div>
                  <div className="text-sm text-red-600 font-semibold mt-1">Échecs</div>
                </div>
              )}
            </div>
          </div>

          {result.errors.length > 0 && (
            <details className="bg-white rounded-lg p-4">
              <summary className="cursor-pointer font-semibold text-sm flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-500" />
                Voir les erreurs détaillées ({result.errors.length})
              </summary>
              <ul className="mt-3 space-y-1 text-xs max-h-40 overflow-y-auto">
                {result.errors.map((error, i) => (
                  <li key={i} className="text-red-700 pl-4">• {error}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="mt-6 space-y-3">
            {result.imported > 0 && (
              <button
                onClick={() => {
                  if (onComplete) onComplete();
                  else window.location.href = '/admin';
                }}
                className="w-full py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
              >
                ✅ Terminer
              </button>
            )}
            <button
              onClick={() => {
                setWizardStep(1);
                setFile(null);
                setResult(null);
                setPreviewData([]);
              }}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Importer d'autres données
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const steps = [
    { number: 1, title: 'Type', render: renderStep1 },
    { number: 2, title: 'Template', render: renderStep2 },
    { number: 3, title: 'Remplir', render: renderStep3 },
    { number: 4, title: 'Upload', render: renderStep4 },
    { number: 5, title: 'Import', render: renderStep5 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                wizardStep >= step.number
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step.number}
              </div>
              <span className={`ml-2 text-sm font-semibold ${
                wizardStep >= step.number ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
              {idx < steps.length - 1 && (
                <ChevronRight className="mx-2 text-gray-300" size={20} />
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(wizardStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Render current step */}
      {steps[wizardStep - 1].render()}

      {/* Skip button (only in onboarding mode) */}
      {!standalone && onSkip && wizardStep < 5 && (
        <button
          onClick={onSkip}
          className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-all text-sm font-semibold"
        >
          ⏭️ Passer cette étape (vous pourrez importer plus tard)
        </button>
      )}
    </div>
  );
}
