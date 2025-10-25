'use client';

import React, { useState, useEffect } from 'react';

// Types
interface Template {
  id: string;
  category: string;
  title: string;
  emoji: string;
  message: string;
  variables: string[];
}

interface Organization {
  id: string;
  name: string;
  phone: string;
  contactName?: string;
  plan?: string;
  email?: string;
}

interface VariableValues {
  [key: string]: string;
}

interface CommunicationHistory {
  id: string;
  type: 'whatsapp' | 'email';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  templateUsed?: string;
}

// Templates pour LAIA Connect (plateforme SaaS)
const mockTemplates: Template[] = [
  // Bienvenue
  {
    id: 'welcome-1',
    category: 'Bienvenue',
    title: 'Bienvenue LAIA Connect',
    emoji: '🎉',
    message: 'Bonjour {{nom}}, bienvenue sur LAIA Connect ! 🎉\n\nVotre compte est actif. Commencez à digitaliser votre institut dès maintenant !\n\n✨ Réservations en ligne\n📅 Planning optimisé\n💬 Communication clients\n\nBelle journée ! 💫',
    variables: ['nom']
  },
  {
    id: 'welcome-2',
    category: 'Bienvenue',
    title: 'Activation compte',
    emoji: '🚀',
    message: 'Bonjour {{nom}} ! 🚀\n\nVotre compte LAIA Connect est maintenant actif.\n\nConnectez-vous ici : https://laia-beauty.com/login\n\nBesoin d\'aide ? Notre équipe est là pour vous ! 💬',
    variables: ['nom']
  },
  // Essai
  {
    id: 'trial-1',
    category: 'Essai',
    title: 'Rappel fin d\'essai',
    emoji: '⏰',
    message: 'Bonjour {{nom}},\n\nVotre période d\'essai se termine dans {{jours}} jours. ⏰\n\nPour continuer à profiter de LAIA Connect, pensez à choisir votre abonnement !\n\nQuestions ? Contactez-nous ! 💬',
    variables: ['nom', 'jours']
  },
  {
    id: 'trial-2',
    category: 'Essai',
    title: 'Prolongation essai',
    emoji: '🎁',
    message: 'Bonne nouvelle {{nom}} ! 🎁\n\nNous vous offrons {{jours}} jours supplémentaires pour tester LAIA Connect.\n\nProfitez-en pour découvrir toutes nos fonctionnalités ! ✨',
    variables: ['nom', 'jours']
  },
  // Abonnement
  {
    id: 'subscription-1',
    category: 'Abonnement',
    title: 'Confirmation abonnement',
    emoji: '✅',
    message: 'Merci {{nom}} ! ✅\n\nVotre abonnement {{plan}} est confirmé.\n\nMontant : {{montant}}€/mois\nProchaine facturation : {{date}}\n\nBienvenue dans la famille LAIA Connect ! 💫',
    variables: ['nom', 'plan', 'montant', 'date']
  },
  {
    id: 'subscription-2',
    category: 'Abonnement',
    title: 'Renouvellement abonnement',
    emoji: '🔄',
    message: 'Bonjour {{nom}},\n\nVotre abonnement {{plan}} sera renouvelé le {{date}} pour {{montant}}€.\n\nTout est automatique, rien à faire ! 😊\n\nQuestions ? On est là ! 💬',
    variables: ['nom', 'plan', 'date', 'montant']
  },
  // Nouveautés
  {
    id: 'feature-1',
    category: 'Nouveautés',
    title: 'Nouvelle fonctionnalité',
    emoji: '✨',
    message: 'Nouveauté LAIA Connect ! ✨\n\nBonjour {{nom}},\n\nDécouvrez {{feature}} : une nouvelle façon d\'optimiser votre institut ! 🚀\n\nConnectez-vous pour l\'essayer dès maintenant ! 💫',
    variables: ['nom', 'feature']
  },
  {
    id: 'feature-2',
    category: 'Nouveautés',
    title: 'Mise à jour importante',
    emoji: '🔔',
    message: 'Mise à jour LAIA Connect ! 🔔\n\nBonjour {{nom}},\n\nNous avons amélioré {{feature}} pour vous offrir une meilleure expérience !\n\nDécouvrez les changements dans votre espace. ✨',
    variables: ['nom', 'feature']
  },
  // Support
  {
    id: 'support-1',
    category: 'Support',
    title: 'Message support',
    emoji: '💬',
    message: 'Bonjour {{nom}} ! 💬\n\nNotre équipe LAIA Connect est à votre écoute.\n\nBesoin d\'aide ?\n📧 support@laia-beauty.com\n💬 Chat en ligne 7j/7\n\nNous sommes là pour vous ! 🌟',
    variables: ['nom']
  },
  {
    id: 'support-2',
    category: 'Support',
    title: 'Suivi ticket',
    emoji: '🎫',
    message: 'Bonjour {{nom}},\n\nVotre ticket #{{ticket}} a été traité ! ✅\n\nNotre équipe vous a répondu par email.\n\nBesoin d\'autre chose ? On est là ! 💬',
    variables: ['nom', 'ticket']
  },
  // Facturation
  {
    id: 'billing-1',
    category: 'Facturation',
    title: 'Facture disponible',
    emoji: '💳',
    message: 'Bonjour {{nom}},\n\nVotre facture du mois {{mois}} est disponible ! 💳\n\nMontant : {{montant}}€\n\nTéléchargez-la dans votre espace facturation. 📄',
    variables: ['nom', 'mois', 'montant']
  },
  {
    id: 'billing-2',
    category: 'Facturation',
    title: 'Échec de paiement',
    emoji: '⚠️',
    message: 'Attention {{nom}}, ⚠️\n\nLe paiement de {{montant}}€ n\'a pas pu être effectué.\n\nMerci de mettre à jour vos informations de paiement pour continuer à profiter de LAIA Connect.\n\nBesoin d\'aide ? Contactez-nous ! 💬',
    variables: ['nom', 'montant']
  }
];

const categories = ['Tous', 'Bienvenue', 'Essai', 'Abonnement', 'Nouveautés', 'Support', 'Facturation'];

const SuperAdminWhatsAppSimple: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [variableValues, setVariableValues] = useState<VariableValues>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger les organisations au démarrage
  useEffect(() => {
    loadOrganizations();
  }, []);

  // Filter templates based on category and search
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'Tous' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Charger les organisations depuis l'API
  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/super-admin/organizations-list');

      if (response.ok) {
        const data = await response.json();
        const orgsWithPhone = data.filter((org: any) => org.phone && org.phone !== '');
        setOrganizations(orgsWithPhone.map((org: any) => ({
          id: org.id,
          name: org.name,
          phone: org.phone,
          contactName: org.contactName || org.name,
          plan: org.subscriptionPlan || 'Standard',
          email: org.email
        })));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des organisations:', error);
    }
  };

  // Charger l'historique de communication pour une organisation
  const loadCommunicationHistory = async (organizationId: string) => {
    try {
      const response = await fetch(`/api/super-admin/organizations/${organizationId}/communications`);

      if (response.ok) {
        const data = await response.json();
        setCommunicationHistory(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setCommunicationHistory([]);
    }
  };

  // Initialize variable values when template is selected
  useEffect(() => {
    if (selectedTemplate && selectedOrganization) {
      const initialValues: VariableValues = {};
      selectedTemplate.variables.forEach(variable => {
        switch (variable) {
          case 'nom':
            initialValues[variable] = selectedOrganization.contactName || selectedOrganization.name;
            break;
          case 'plan':
            initialValues[variable] = selectedOrganization.plan || 'Standard';
            break;
          case 'jours':
            initialValues[variable] = '7';
            break;
          case 'montant':
            initialValues[variable] = '49';
            break;
          case 'date':
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            initialValues[variable] = nextMonth.toLocaleDateString('fr-FR');
            break;
          case 'mois':
            const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            initialValues[variable] = currentMonth;
            break;
          case 'feature':
            initialValues[variable] = 'le nouveau système de notifications';
            break;
          case 'ticket':
            initialValues[variable] = '12345';
            break;
          default:
            initialValues[variable] = '';
        }
      });
      setVariableValues(initialValues);
    }
  }, [selectedTemplate, selectedOrganization]);

  // Generate preview message
  const generatePreview = (): string => {
    if (!selectedTemplate) return '';
    let preview = selectedTemplate.message;
    Object.entries(variableValues).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
    });
    return preview;
  };

  // Handle step transition with animation
  const goToStep = (step: 1 | 2 | 3) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsAnimating(false);
    }, 150);
  };

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    goToStep(2);
  };

  // Handle organization selection
  const handleOrganizationSelect = (org: Organization) => {
    setSelectedOrganization(org);
    loadCommunicationHistory(org.id);
    goToStep(3);
  };

  // Format phone number for WhatsApp
  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '33' + cleaned.substring(1);
    } else if (!cleaned.startsWith('33')) {
      cleaned = '33' + cleaned;
    }
    return '+' + cleaned;
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!selectedOrganization || !selectedTemplate) return;

    setLoading(true);
    const message = generatePreview();

    try {
      const formattedPhone = formatPhoneNumber(selectedOrganization.phone);

      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message,
          clientName: selectedOrganization.contactName || selectedOrganization.name,
          organizationId: selectedOrganization.id,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.title
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newHistory: CommunicationHistory = {
          id: Date.now().toString(),
          type: 'whatsapp',
          content: message,
          timestamp: new Date(),
          status: 'sent',
          templateUsed: selectedTemplate.title
        };
        setCommunicationHistory(prev => [newHistory, ...prev]);

        alert('Message envoyé avec succès !');
        resetFlow();
      } else {
        alert(`Erreur lors de l'envoi: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur de connexion lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  // Reset to start
  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedTemplate(null);
    setSelectedOrganization(null);
    setVariableValues({});
    setSearchTerm('');
    setSelectedCategory('Tous');
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">
            📱 WhatsApp LAIA Connect
          </h1>
          <p className="text-stone-600">
            Communiquez avec vos organisations via WhatsApp
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] shadow-lg'
                      : 'bg-stone-300'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all duration-300 ${
                      currentStep > step ? 'bg-[#c9a084]' : 'bg-stone-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-16 text-sm text-stone-600">
            <span className={currentStep === 1 ? 'font-semibold text-[#c9a084]' : ''}>
              📝 Sélectionner un modèle
            </span>
            <span className={currentStep === 2 ? 'font-semibold text-[#c9a084]' : ''}>
              🏢 Choisir une organisation
            </span>
            <span className={currentStep === 3 ? 'font-semibold text-[#c9a084]' : ''}>
              ✨ Personnaliser et envoyer
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="🔍 Rechercher un modèle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#c9a084] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-md'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-[#d4b5a0]"
                    >
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">{template.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-stone-800">{template.title}</h3>
                          <span className="text-xs bg-[#d4b5a0] text-white px-2 py-1 rounded-full">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-stone-600 line-clamp-3">
                        {template.message.replace(/{{.*?}}/g, '...')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Selected Template Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-stone-800">
                    {selectedTemplate?.emoji} {selectedTemplate?.title}
                  </h2>
                  <button
                    onClick={() => goToStep(1)}
                    className="text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    ← Retour
                  </button>
                </div>
                <p className="text-stone-600 bg-stone-50 p-4 rounded-xl whitespace-pre-line">
                  {selectedTemplate?.message}
                </p>
              </div>

              {/* Organization Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">
                  🏢 Sélectionner une organisation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => handleOrganizationSelect(org)}
                      className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-[#d4b5a0]"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {org.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-stone-800">{org.name}</h4>
                          <p className="text-sm text-stone-600">{org.phone}</p>
                        </div>
                      </div>
                      {org.contactName && (
                        <p className="text-xs text-stone-500 mb-2">
                          👤 Contact: {org.contactName}
                        </p>
                      )}
                      {org.plan && (
                        <p className="text-xs text-stone-500">
                          💼 Plan: {org.plan}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customization Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-stone-800">
                      ✨ Personnaliser le message
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-stone-500 hover:text-stone-700 transition-colors text-sm bg-stone-100 px-3 py-1 rounded-lg"
                      >
                        📊 Historique
                      </button>
                      <button
                        onClick={() => goToStep(2)}
                        className="text-stone-500 hover:text-stone-700 transition-colors"
                      >
                        ← Retour
                      </button>
                    </div>
                  </div>

                  {/* Organization Info */}
                  <div className="bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-stone-800 mb-2">🏢 Organisation sélectionnée</h3>
                    <p className="text-stone-700">{selectedOrganization?.name}</p>
                    <p className="text-sm text-stone-600">{selectedOrganization?.phone}</p>
                    {selectedOrganization?.contactName && (
                      <p className="text-sm text-stone-600">Contact: {selectedOrganization.contactName}</p>
                    )}
                  </div>

                  {/* Communication History */}
                  {showHistory && (
                    <div className="bg-stone-50 rounded-xl p-4 mb-6 max-h-60 overflow-y-auto">
                      <h3 className="font-semibold text-stone-800 mb-3">📊 Historique des communications</h3>
                      {communicationHistory.length === 0 ? (
                        <p className="text-stone-500 text-sm">Aucun historique disponible</p>
                      ) : (
                        <div className="space-y-3">
                          {communicationHistory.map((comm) => (
                            <div key={comm.id} className="bg-white rounded-lg p-3 border-l-4 border-[#d4b5a0]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-[#c9a084]">
                                  {comm.type === 'whatsapp' ? '📱 WhatsApp' : '📧 Email'}
                                </span>
                                <span className="text-xs text-stone-500">
                                  {comm.timestamp.toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <p className="text-sm text-stone-700 mb-1">{comm.content}</p>
                              {comm.templateUsed && (
                                <p className="text-xs text-stone-500">Template: {comm.templateUsed}</p>
                              )}
                              <div className="flex items-center mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  comm.status === 'sent' ? 'bg-green-100 text-green-800' :
                                  comm.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                  comm.status === 'read' ? 'bg-purple-100 text-purple-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {comm.status === 'sent' ? 'Envoyé' :
                                   comm.status === 'delivered' ? 'Livré' :
                                   comm.status === 'read' ? 'Lu' : 'Échec'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Variable Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-stone-800">🔧 Variables à personnaliser</h3>
                    {selectedTemplate?.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-sm font-medium text-stone-700 mb-2 capitalize">
                          {variable === 'nom' && '👤 Nom'}
                          {variable === 'plan' && '💼 Plan'}
                          {variable === 'jours' && '📅 Jours'}
                          {variable === 'montant' && '💰 Montant (€)'}
                          {variable === 'date' && '📅 Date'}
                          {variable === 'mois' && '📅 Mois'}
                          {variable === 'feature' && '✨ Fonctionnalité'}
                          {variable === 'ticket' && '🎫 Ticket'}
                          {!['nom', 'plan', 'jours', 'montant', 'date', 'mois', 'feature', 'ticket'].includes(variable) && `📝 ${variable}`}
                        </label>
                        <input
                          type="text"
                          value={variableValues[variable] || ''}
                          onChange={(e) => setVariableValues(prev => ({
                            ...prev,
                            [variable]: e.target.value
                          }))}
                          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#c9a084] focus:outline-none transition-colors"
                          placeholder={`Entrez ${variable}...`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSendMessage}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <>📱 Envoyer via WhatsApp</>
                      )}
                    </button>
                    <button
                      onClick={resetFlow}
                      className="px-6 py-4 border-2 border-stone-300 text-stone-600 rounded-xl font-semibold transition-all duration-200 hover:bg-stone-50"
                    >
                      🔄 Recommencer
                    </button>
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">
                    👁️ Aperçu du message
                  </h3>

                  {/* Phone Mockup */}
                  <div className="bg-gradient-to-b from-stone-800 to-stone-900 rounded-3xl p-4 max-w-sm mx-auto">
                    <div className="bg-green-500 rounded-2xl p-4 h-96 flex flex-col">
                      {/* WhatsApp Header */}
                      <div className="flex items-center bg-green-600 -m-4 mb-4 p-4 rounded-t-2xl">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-bold text-sm">
                            {selectedOrganization?.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'LB'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {selectedOrganization?.contactName || selectedOrganization?.name || 'Organisation'}
                          </p>
                          <p className="text-green-100 text-xs">en ligne</p>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="bg-white rounded-lg p-3 ml-2 max-w-[85%] shadow-sm">
                          <p className="text-stone-800 text-sm whitespace-pre-wrap">
                            {generatePreview() || 'Votre message apparaîtra ici...'}
                          </p>
                          <div className="flex justify-end mt-2">
                            <span className="text-xs text-stone-500">
                              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Input Area */}
                      <div className="bg-white rounded-full p-2 mt-4 flex items-center">
                        <div className="flex-1 px-3 py-2 text-sm text-stone-400">
                          Tapez un message...
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🎤</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Stats */}
                  <div className="mt-4 text-center text-sm text-stone-600">
                    <p>📝 Caractères: {generatePreview().length}</p>
                    <p>📱 Format: WhatsApp</p>
                    <p>📊 Template: {selectedTemplate?.title}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminWhatsAppSimple;
