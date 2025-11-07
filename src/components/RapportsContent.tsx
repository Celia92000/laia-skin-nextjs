'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Mail, Calendar, TrendingUp, Users, Euro, DollarSign, BarChart3, PieChart, Plus, Trash2, Eye, Save, Settings } from 'lucide-react';

interface ReportMetric {
  id: string;
  name: string;
  icon: any;
  category: 'revenue' | 'clients' | 'appointments' | 'products';
  enabled: boolean;
}

interface SavedReport {
  id: string;
  name: string;
  metrics: string[];
  period: string;
  createdAt: string;
  lastSent?: string;
  autoSend: boolean;
  emailSchedule?: 'daily' | 'weekly' | 'monthly';
}

export default function RapportsContent() {
  const [activeTab, setActiveTab] = useState<'builder' | 'saved'>('builder');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [reportName, setReportName] = useState('');
  const [autoSend, setAutoSend] = useState(false);
  const [emailSchedule, setEmailSchedule] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [generating, setGenerating] = useState(false);

  const availableMetrics: ReportMetric[] = [
    { id: 'revenue', name: 'Revenus totaux', icon: Euro, category: 'revenue', enabled: true },
    { id: 'clients_count', name: 'Nombre de clients', icon: Users, category: 'clients', enabled: true },
    { id: 'new_clients', name: 'Nouveaux clients', icon: Users, category: 'clients', enabled: true },
    { id: 'appointments', name: 'Rendez-vous', icon: Calendar, category: 'appointments', enabled: true },
    { id: 'completed_appointments', name: 'RDV complétés', icon: Calendar, category: 'appointments', enabled: false },
    { id: 'avg_ticket', name: 'Panier moyen', icon: DollarSign, category: 'revenue', enabled: true },
    { id: 'products_sold', name: 'Produits vendus', icon: BarChart3, category: 'products', enabled: false },
    { id: 'top_services', name: 'Services populaires', icon: TrendingUp, category: 'appointments', enabled: false },
    { id: 'client_retention', name: 'Taux de rétention', icon: Users, category: 'clients', enabled: false },
    { id: 'conversion_rate', name: 'Taux de conversion', icon: TrendingUp, category: 'clients', enabled: false },
  ];

  const [metrics, setMetrics] = useState(availableMetrics);

  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedReports(data);
      }
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    }
  };

  const toggleMetric = (id: string) => {
    setMetrics(metrics.map(m =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const generateReport = async (format: 'pdf' | 'preview') => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const enabledMetrics = metrics.filter(m => m.enabled).map(m => m.id);

      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          metrics: enabledMetrics,
          period: selectedPeriod,
          format
        })
      });

      if (response.ok) {
        if (format === 'pdf') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `rapport-${new Date().toISOString().split('T')[0]}.pdf`;
          a.click();
        } else {
          alert('Aperçu du rapport généré avec succès !');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setGenerating(false);
    }
  };

  const saveReport = async () => {
    if (!reportName.trim()) {
      alert('Veuillez donner un nom au rapport');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const enabledMetrics = metrics.filter(m => m.enabled).map(m => m.id);

      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: reportName,
          metrics: enabledMetrics,
          period: selectedPeriod,
          autoSend,
          emailSchedule: autoSend ? emailSchedule : null
        })
      });

      if (response.ok) {
        alert('Rapport sauvegardé avec succès !');
        setReportName('');
        loadSavedReports();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du rapport');
    }
  };

  const sendReportByEmail = async (reportId?: string) => {
    try {
      const token = localStorage.getItem('token');
      const enabledMetrics = metrics.filter(m => m.enabled).map(m => m.id);

      const response = await fetch('/api/admin/reports/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reportId,
          metrics: reportId ? undefined : enabledMetrics,
          period: selectedPeriod
        })
      });

      if (response.ok) {
        alert('Rapport envoyé par email avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi du rapport');
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Rapport supprimé avec succès !');
        loadSavedReports();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du rapport');
    }
  };

  const downloadSavedReport = async (report: SavedReport) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          metrics: report.metrics,
          period: report.period,
          format: 'pdf'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du rapport');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b bg-white rounded-t-lg px-4">
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'builder'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Builder de rapports
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'saved'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Save className="w-4 h-4 inline mr-2" />
          Rapports sauvegardés ({savedReports.length})
        </button>
      </div>

      {/* Builder Tab */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration du rapport
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du rapport (optionnel)
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Ex: Rapport mensuel complet"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période d'analyse
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">90 derniers jours</option>
                  <option value="1y">1 an</option>
                  <option value="custom">Période personnalisée</option>
                </select>
              </div>
            </div>

            {/* Envoi automatique */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="autoSend"
                  checked={autoSend}
                  onChange={(e) => setAutoSend(e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <label htmlFor="autoSend" className="font-medium text-gray-900">
                  Envoi automatique par email
                </label>
              </div>

              {autoSend && (
                <select
                  value={emailSchedule}
                  onChange={(e) => setEmailSchedule(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
              )}
            </div>
          </div>

          {/* Métriques */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Sélectionner les métriques</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <button
                    key={metric.id}
                    onClick={() => toggleMetric(metric.id)}
                    className={`p-4 rounded-lg border-2 transition ${
                      metric.enabled
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${metric.enabled ? 'text-purple-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${metric.enabled ? 'text-purple-900' : 'text-gray-700'}`}>
                        {metric.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => generateReport('preview')}
                disabled={!metrics.some(m => m.enabled) || generating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Aperçu
              </button>

              <button
                onClick={() => generateReport('pdf')}
                disabled={!metrics.some(m => m.enabled) || generating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                {generating ? 'Génération...' : 'Télécharger PDF'}
              </button>

              <button
                onClick={() => sendReportByEmail()}
                disabled={!metrics.some(m => m.enabled)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Envoyer par email
              </button>

              {reportName && (
                <button
                  onClick={saveReport}
                  disabled={!metrics.some(m => m.enabled)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Sauvegarder
                </button>
              )}
            </div>

            {!metrics.some(m => m.enabled) && (
              <p className="text-sm text-red-600 mt-4">
                ⚠️ Veuillez sélectionner au moins une métrique
              </p>
            )}
          </div>
        </div>
      )}

      {/* Saved Reports Tab */}
      {activeTab === 'saved' && (
        <div className="bg-white rounded-lg shadow-md">
          {savedReports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucun rapport sauvegardé
              </h3>
              <p className="text-gray-500">
                Créez votre premier rapport dans l'onglet Builder
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {savedReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {report.name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>📊 {report.metrics.length} métriques</span>
                        <span>📅 Période: {report.period}</span>
                        {report.autoSend && (
                          <span className="text-green-600">
                            ✉️ Envoi {report.emailSchedule === 'daily' ? 'quotidien' : report.emailSchedule === 'weekly' ? 'hebdomadaire' : 'mensuel'}
                          </span>
                        )}
                        {report.lastSent && (
                          <span>Dernier envoi: {new Date(report.lastSent).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => downloadSavedReport(report)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Télécharger PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => sendReportByEmail(report.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Envoyer par email"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
