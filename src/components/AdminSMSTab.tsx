"use client";

import { useState, useEffect } from "react";
import { formatDateLocal } from '@/lib/date-utils';
import {
  Plus, Edit2, Save, X, Send, Clock, Calendar, Users,
  Search, ChevronUp, ChevronDown, Smartphone, CheckCircle,
  AlertCircle, TrendingUp, FileText, Trash2, Copy
} from "lucide-react";

interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  segmentId?: string;
  recipientCount: number;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  scheduledAt?: string;
  sentAt?: string;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  clickedCount: number;
  totalCost?: number;
  createdAt: string;
}

interface SMSTemplate {
  id: string;
  name: string;
  type: string;
  message: string;
  active: boolean;
}

const DEFAULT_TEMPLATES: Omit<SMSTemplate, 'id'>[] = [
  {
    name: "Rappel RDV",
    type: "APPOINTMENT",
    message: "Bonjour {{prenom}}, rappel de votre RDV demain à {{heureRDV}} chez {{institut}}. À très vite ! 💆",
    active: true
  },
  {
    name: "Confirmation RDV",
    type: "CONFIRMATION",
    message: "Bonjour {{prenom}}, votre RDV du {{dateRDV}} à {{heureRDV}} est confirmé chez {{institut}}. À bientôt ! ✨",
    active: true
  },
  {
    name: "Anniversaire",
    type: "BIRTHDAY",
    message: "Joyeux anniversaire {{prenom}} ! 🎉 Profitez de -20% sur votre prochain soin chez {{institut}}. Code: ANNIV20",
    active: true
  },
  {
    name: "Promotion Flash",
    type: "PROMOTION",
    message: "🎁 FLASH ! -30% sur tous nos soins ce week-end chez {{institut}}. Réservez vite : {{lienReservation}}",
    active: true
  },
  {
    name: "Suivi après soin",
    type: "FOLLOW_UP",
    message: "Bonjour {{prenom}}, comment s'est passé votre soin {{service}} ? Votre avis compte pour nous ! 💕 {{institut}}",
    active: true
  },
  {
    name: "Points fidélité",
    type: "LOYALTY",
    message: "Félicitations {{prenom}} ! 🌟 Vous avez {{points}} points fidélité. 1 soin gratuit à partir de 100 points ! {{institut}}",
    active: true
  }
];

export default function AdminSMSTab() {
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([]);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [editingCampaign, setEditingCampaign] = useState<SMSCampaign | null>(null);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/sms/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des campagnes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/sms/templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.length > 0 ? data : DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `template-${i}` })));
      } else {
        setTemplates(DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `template-${i}` })));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      setTemplates(DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `template-${i}` })));
    }
  };

  const handleSaveCampaign = async (campaign: SMSCampaign) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const method = campaign.id && campaign.id !== 'new' ? 'PUT' : 'POST';
      const url = campaign.id && campaign.id !== 'new'
        ? `/api/admin/sms/campaigns/${campaign.id}`
        : '/api/admin/sms/campaigns';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaign)
      });

      if (response.ok) {
        await fetchCampaigns();
        setEditingCampaign(null);
        setShowNewCampaignForm(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la campagne:', error);
      setSaveStatus('error');
    }
  };

  const handleSendCampaign = async (campaign: SMSCampaign) => {
    if (!confirm(`Êtes-vous sûr de vouloir envoyer cette campagne à ${campaign.recipientCount} destinataires ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/sms/campaigns/${campaign.id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCampaigns();
        alert('Campagne envoyée avec succès !');
      } else {
        alert('Erreur lors de l\'envoi de la campagne');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi de la campagne');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/sms/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const toggleCampaignExpansion = (id: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCampaigns(newExpanded);
  };

  const useTemplate = (template: SMSTemplate) => {
    setEditingCampaign({
      id: 'new',
      name: template.name,
      message: template.message,
      recipientCount: 0,
      status: 'DRAFT',
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      clickedCount: 0,
      createdAt: new Date().toISOString()
    });
    setShowNewCampaignForm(true);
    setShowTemplates(false);
    setCharCount(template.message.length);
  };

  const CampaignForm = ({ campaign, onClose }: { campaign: SMSCampaign | null, onClose: () => void }) => {
    const [formData, setFormData] = useState<SMSCampaign>(campaign || {
      id: 'new',
      name: '',
      message: '',
      recipientCount: 0,
      status: 'DRAFT',
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      clickedCount: 0,
      createdAt: new Date().toISOString()
    } as SMSCampaign);

    const handleMessageChange = (value: string) => {
      setFormData({ ...formData, message: value });
      setCharCount(value.length);
    };

    const smsCount = Math.ceil(formData.message.length / 160);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-3xl w-full my-8">
          <div className="sticky top-0 bg-white border-b border-green-200 p-6 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-green-600" />
              {formData.id === 'new' ? 'Nouvelle Campagne SMS' : `Modifier ${formData.name}`}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-green-50 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveCampaign(formData); }} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Nom de la campagne *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Promo Saint-Valentin"
                className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#2c3e50]">
                  Message SMS *
                </label>
                <div className="text-sm">
                  <span className={`font-medium ${charCount > 160 ? 'text-orange-600' : 'text-green-600'}`}>
                    {charCount}/160
                  </span>
                  <span className="text-gray-500 ml-2">({smsCount} SMS)</span>
                </div>
              </div>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Votre message ici... Utilisez {{prenom}}, {{nom}}, {{institut}} pour personnaliser"
                className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Variables disponibles: {'{{'} prenom {'}}'},  {'{{'} nom {'}}'},  {'{{'} dateRDV {'}}'},  {'{{'} heureRDV {'}}'},  {'{{'} service {'}}'},  {'{{'} institut {'}}'},  {'{{'} points {'}}'}
              </p>
              {charCount > 160 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Votre message fait plus de 160 caractères et sera envoyé en {smsCount} SMS
                </p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-[#2c3e50] mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Destinataires
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="segment"
                    checked={!formData.segmentId}
                    onChange={() => setFormData({ ...formData, segmentId: undefined, recipientCount: 0 })}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Tous les clients</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="segment"
                    checked={formData.segmentId === 'vip'}
                    onChange={() => setFormData({ ...formData, segmentId: 'vip', recipientCount: 0 })}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Clients VIP uniquement</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="segment"
                    checked={formData.segmentId === 'inactive'}
                    onChange={() => setFormData({ ...formData, segmentId: 'inactive', recipientCount: 0 })}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Clients inactifs (dernière visite &gt; 3 mois)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                Planification (optionnel)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt ? formatDateLocal(formData.scheduledAt, true) : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  status: e.target.value ? 'SCHEDULED' : 'DRAFT'
                })}
                className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Laissez vide pour envoyer immédiatement après validation
              </p>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-green-200">
              <div>
                {saveStatus === 'saved' && (
                  <p className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Enregistré avec succès !
                  </p>
                )}
                {saveStatus === 'error' && (
                  <p className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Erreur lors de l'enregistrement
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-green-200 text-[#2c3e50] rounded-lg hover:bg-green-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-2">
            <Smartphone className="w-8 h-8 text-green-600" />
            SMS Marketing
          </h2>
          <p className="text-sm text-[#2c3e50]/60 mt-1">
            Créez et gérez vos campagnes SMS
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Templates
          </button>
          <button
            onClick={() => {
              setEditingCampaign({
                id: 'new',
                name: '',
                message: '',
                recipientCount: 0,
                status: 'DRAFT',
                sentCount: 0,
                deliveredCount: 0,
                failedCount: 0,
                clickedCount: 0,
                createdAt: new Date().toISOString()
              });
              setShowNewCampaignForm(true);
              setCharCount(0);
            }}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Campagne
          </button>
        </div>
      </div>

      {/* Statistics */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total campagnes</p>
                <p className="text-2xl font-bold text-[#2c3e50]">{campaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">SMS envoyés</p>
                <p className="text-2xl font-bold text-[#2c3e50]">
                  {campaigns.reduce((sum, c) => sum + c.sentCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Délivrés</p>
                <p className="text-2xl font-bold text-[#2c3e50]">
                  {campaigns.reduce((sum, c) => sum + c.deliveredCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taux de livraison</p>
                <p className="text-2xl font-bold text-[#2c3e50]">
                  {campaigns.reduce((sum, c) => sum + c.sentCount, 0) > 0
                    ? Math.round(
                        (campaigns.reduce((sum, c) => sum + c.deliveredCount, 0) /
                          campaigns.reduce((sum, c) => sum + c.sentCount, 0)) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Panel */}
      {showTemplates && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Templates SMS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.filter(t => t.active).map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-[#2c3e50]">{template.name}</h4>
                    <span className="text-xs text-gray-500 uppercase">{template.type}</span>
                  </div>
                  <button
                    onClick={() => useTemplate(template)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Utiliser ce template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">{template.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Aucune campagne SMS pour le moment</p>
            <button
              onClick={() => {
                setEditingCampaign({
                  id: 'new',
                  name: '',
                  message: '',
                  recipientCount: 0,
                  status: 'DRAFT',
                  sentCount: 0,
                  deliveredCount: 0,
                  failedCount: 0,
                  clickedCount: 0,
                  createdAt: new Date().toISOString()
                });
                setShowNewCampaignForm(true);
              }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg"
            >
              Créer votre première campagne
            </button>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#2c3e50]">{campaign.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          campaign.status === 'SENT'
                            ? 'bg-green-100 text-green-700'
                            : campaign.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-700'
                            : campaign.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {campaign.status === 'SENT' && '✓ Envoyé'}
                        {campaign.status === 'SCHEDULED' && '⏰ Programmé'}
                        {campaign.status === 'DRAFT' && '📝 Brouillon'}
                        {campaign.status === 'FAILED' && '✗ Échec'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{campaign.message}</p>

                    {campaign.status === 'SENT' && (
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-500">Envoyés:</span>
                          <span className="font-medium text-[#2c3e50] ml-2">{campaign.sentCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Délivrés:</span>
                          <span className="font-medium text-green-600 ml-2">{campaign.deliveredCount}</span>
                        </div>
                        {campaign.failedCount > 0 && (
                          <div>
                            <span className="text-gray-500">Échecs:</span>
                            <span className="font-medium text-red-600 ml-2">{campaign.failedCount}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {campaign.scheduledAt && campaign.status === 'SCHEDULED' && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                        <Clock className="w-4 h-4" />
                        Envoi prévu le {new Date(campaign.scheduledAt).toLocaleString('fr-FR')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {campaign.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSendCampaign(campaign)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Envoyer"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingCampaign(campaign)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Forms */}
      {(showNewCampaignForm || editingCampaign) && (
        <CampaignForm
          campaign={editingCampaign}
          onClose={() => {
            setEditingCampaign(null);
            setShowNewCampaignForm(false);
          }}
        />
      )}
    </div>
  );
}
