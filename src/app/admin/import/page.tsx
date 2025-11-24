'use client';

import { useRouter } from 'next/navigation';
import AssistedDataImport from '@/components/AssistedDataImport';

export default function ImportDataPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              📥 Import de données
            </h1>
            <p className="text-gray-600 mt-1">
              Assistant guidé pour importer vos données existantes
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold"
          >
            ← Retour
          </button>
        </div>

        <AssistedDataImport standalone={true} />
      </div>
    </div>
  );
}
