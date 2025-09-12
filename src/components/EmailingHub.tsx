'use client';

import React, { useState } from 'react';
import { Mail, Users, Zap, Filter, Send, BarChart3 } from 'lucide-react';
import ClientSegmentation from './ClientSegmentation';
import EmailAutomations from './EmailAutomations';
import EmailCampaignHistory from './EmailCampaignHistory';

export default function EmailingHub() {
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'automations' | 'history'>('campaigns');

  return (
    <div>
      {/* Header avec sous-onglets */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-500" />
            Centre Emailing
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('campaigns')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'campaigns'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Send className="w-4 h-4" />
              Campagnes & Segmentation
            </button>
            <button
              onClick={() => setActiveSubTab('automations')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'automations'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              Automatisations
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeSubTab === 'history'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Historique & Rapports
            </button>
          </div>
        </div>
      </div>

      {/* Contenu des sous-onglets */}
      {activeSubTab === 'campaigns' && <ClientSegmentation />}
      {activeSubTab === 'automations' && <EmailAutomations />}
      {activeSubTab === 'history' && <EmailCampaignHistory />}
    </div>
  );
}