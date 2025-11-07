'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap, Plus, Edit2, Trash2, Play, Pause, Mail, Clock,
  Activity, Eye, Copy, Send, TrendingUp, Users, Calendar,
  ArrowRight, CheckCircle, XCircle, Target
} from 'lucide-react';
import { defaultWorkflowTemplates } from '@/lib/workflow-templates';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  status: string;
  delayDays: number;
  subject: string;
  emailTemplate: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  updatedAt: string;
  executions?: any[];
  _count?: {
    executions: number;
  };
}

const triggerLabels: Record<string, string> = {
  ONBOARDING_DAY_1: 'J+1 après inscription',
  ONBOARDING_DAY_7: 'J+7 après inscription',
  ONBOARDING_DAY_15: 'J+15 après inscription',
  ONBOARDING_DAY_25: 'J+25 (5 jours avant fin d\'essai)',
  TRIAL_ENDING_SOON: '5 jours avant fin d\'essai',
  TRIAL_ENDED: 'Fin de période d\'essai',
  NO_LOGIN_7_DAYS: 'Pas de connexion depuis 7 jours',
  NO_BOOKINGS_15_DAYS: '0 rendez-vous après 15 jours',
  SUBSCRIPTION_ACTIVE_60_DAYS: 'Après 60 jours d\'utilisation',
  PAYMENT_FAILED: 'Échec de paiement',
  SUBSCRIPTION_CANCELLED: 'Abonnement annulé',
  HIGH_USAGE: 'Utilisation élevée (upgrade)',
  LOW_USAGE: 'Faible utilisation (risque churn)'
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Partial<Workflow> | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/super-admin/workflows', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setWorkflows(data.workflows);
      }
    } catch (error) {
      console.error('Erreur chargement workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!editingWorkflow) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/super-admin/workflows', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingWorkflow)
      });

      const data = await res.json();
      if (data.success) {
        alert('Workflow enregistré avec succès !');
        setShowEditor(false);
        setEditingWorkflow(null);
        fetchWorkflows();
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur sauvegarde workflow:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleToggleStatus = async (workflow: Workflow) => {
    const newStatus = workflow.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/super-admin/workflows', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...workflow,
          status: newStatus
        })
      });
      fetchWorkflows();
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Archiver ce workflow ?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/super-admin/workflows?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchWorkflows();
    } catch (error) {
      console.error('Erreur suppression workflow:', error);
    }
  };

  const handleLoadTemplate = (template: any) => {
    setEditingWorkflow({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      delayDays: template.delayDays,
      subject: template.subject,
      emailTemplate: template.emailTemplate,
      status: 'ACTIVE'
    });
    setShowEditor(true);
  };

  const handlePreview = () => {
    if (editingWorkflow?.emailTemplate) {
      // Remplacer les variables par des exemples
      let preview = editingWorkflow.emailTemplate;
      const exampleVars: Record<string, string> = {
        '{organizationName}': 'Institut Belle Peau',
        '{ownerFirstName}': 'Marie',
        '{ownerLastName}': 'Dupont',
        '{ownerEmail}': 'marie@institut-bellepeau.fr',
        '{plan}': 'DUO',
        '{subdomain}': 'belle-peau',
        '{demoLink}': 'https://calendly.com/laia-connect/demo',
        '{supportEmail}': 'support@laiaconnect.fr',
        '{dashboardUrl}': 'https://belle-peau.laiaconnect.fr/admin'
      };

      Object.entries(exampleVars).forEach(([key, value]) => {
        preview = preview.replace(new RegExp(key, 'g'), value);
      });

      setPreviewHtml(preview);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-500" />
              Workflows Automatiques
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez vos emails automatiques et suivez leur performance
            </p>
          </div>
          <button
            onClick={() => {
              setEditingWorkflow({ status: 'ACTIVE' });
              setShowEditor(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau workflow
          </button>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Workflows</span>
          </div>
          <p className="text-3xl font-bold">{workflows.filter(w => w.status === 'ACTIVE').length}</p>
          <p className="text-sm opacity-80 mt-1">Actifs sur {workflows.length}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Emails envoyés</span>
          </div>
          <p className="text-3xl font-bold">
            {workflows.reduce((sum, w) => sum + w.sentCount, 0)}
          </p>
          <p className="text-sm opacity-80 mt-1">Total tous workflows</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Taux d'ouverture</span>
          </div>
          <p className="text-3xl font-bold">
            {workflows.length > 0
              ? (workflows.reduce((sum, w) => sum + w.openRate, 0) / workflows.length).toFixed(1)
              : 0}%
          </p>
          <p className="text-sm opacity-80 mt-1">Moyenne globale</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Taux de clic</span>
          </div>
          <p className="text-3xl font-bold">
            {workflows.length > 0
              ? (workflows.reduce((sum, w) => sum + w.clickRate, 0) / workflows.length).toFixed(1)
              : 0}%
          </p>
          <p className="text-sm opacity-80 mt-1">Moyenne globale</p>
        </div>
      </div>

      {/* Templates prédéfinis */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Copy className="w-5 h-5 text-blue-500" />
          Templates prédéfinis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {defaultWorkflowTemplates.map((template, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <button
                onClick={() => handleLoadTemplate(template)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Utiliser ce template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des workflows */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Mes workflows</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{workflow.name}</h3>
                    {workflow.status === 'ACTIVE' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        ✓ Actif
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        ⏸ Pausé
                      </span>
                    )}
                  </div>

                  {workflow.description && (
                    <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {triggerLabels[workflow.trigger] || workflow.trigger}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {workflow.sentCount} envoyés
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {workflow.openRate.toFixed(1)}% ouverture
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {workflow.clickRate.toFixed(1)}% clics
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Créé le {new Date(workflow.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(workflow)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      workflow.status === 'ACTIVE'
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title={workflow.status === 'ACTIVE' ? 'Pause' : 'Activer'}
                  >
                    {workflow.status === 'ACTIVE' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingWorkflow(workflow);
                      setShowEditor(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                    title="Archiver"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {workflows.length === 0 && (
            <div className="p-12 text-center">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun workflow créé
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par utiliser un template prédéfini
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Éditeur de workflow (Modal) */}
      {showEditor && editingWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingWorkflow.id ? 'Modifier le workflow' : 'Nouveau workflow'}
              </h3>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Colonne gauche - Configuration */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du workflow *
                  </label>
                  <input
                    type="text"
                    value={editingWorkflow.name || ''}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Email de bienvenue J+1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingWorkflow.description || ''}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Description du workflow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Déclencheur *
                  </label>
                  <select
                    value={editingWorkflow.trigger || ''}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, trigger: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionner un déclencheur</option>
                    {Object.entries(triggerLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet de l'email *
                  </label>
                  <input
                    type="text"
                    value={editingWorkflow.subject || ''}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Bienvenue sur LAIA Connect !"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variables disponibles
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                    <p><code>{'{organizationName}'}</code> - Nom de l'organisation</p>
                    <p><code>{'{ownerFirstName}'}</code> - Prénom du propriétaire</p>
                    <p><code>{'{ownerLastName}'}</code> - Nom du propriétaire</p>
                    <p><code>{'{plan}'}</code> - Formule d'abonnement</p>
                    <p><code>{'{demoLink}'}</code> - Lien de démo Calendly</p>
                    <p><code>{'{supportEmail}'}</code> - Email support</p>
                    <p><code>{'{dashboardUrl}'}</code> - URL du dashboard</p>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Template email */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template HTML de l'email *
                  </label>
                  <textarea
                    value={editingWorkflow.emailTemplate || ''}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, emailTemplate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                    rows={20}
                    placeholder="Code HTML de l'email..."
                  />
                </div>

                <button
                  onClick={handlePreview}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Prévisualiser l'email
                </button>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between gap-3">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingWorkflow(null);
                  setPreviewHtml('');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveWorkflow}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Enregistrer le workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prévisualisation email (Modal) */}
      {previewHtml && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Prévisualisation de l'email</h3>
              <button
                onClick={() => setPreviewHtml('')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
