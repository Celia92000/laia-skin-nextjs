'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, FileText } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string | null;
  isActive: boolean;
}

// Templates LAIA Connect par défaut
const defaultLaiaTemplates: EmailTemplate[] = [
  {
    id: 'payment-confirmation',
    name: '✅ Confirmation de paiement',
    subject: '✅ Paiement confirmé - {institut} - LAIA Connect',
    content: `Bonjour {nom},

Merci pour votre confiance ! Votre paiement pour {institut} a bien été enregistré.

💳 Détails du paiement
• Institut : {institut}
• Forfait : {plan}
• Montant : {montant}€

📋 Prochaines étapes
1. Notre équipe va préparer votre espace LAIA Connect
2. Vous recevrez vos identifiants de connexion sous 24h
3. Vous pourrez configurer votre site (template, couleurs, contenus)
4. Votre site sera en ligne et prêt à prendre des réservations !

À très bientôt ! 🚀
L'équipe LAIA Connect`,
    category: 'laia-connect',
    isActive: true
  },
  {
    id: 'onboarding-invitation',
    name: '🎉 Invitation onboarding',
    subject: '🎉 Bienvenue sur LAIA Connect - Votre espace est prêt !',
    content: `Bonjour,

Votre institut {institut} est configuré !

Nous avons créé votre espace personnel sur LAIA Connect. Vous pouvez maintenant vous connecter et configurer votre site web en 4 étapes simples.

🔐 Vos identifiants de connexion
• Email : {email}
• Mot de passe temporaire : {password}

⚠️ Important : Vous pourrez changer ce mot de passe après votre première connexion.

📝 Configuration en 4 étapes
1. Choisissez votre template de site - Plus de 12 designs professionnels
2. Personnalisez les couleurs - Adaptez le design à votre image de marque
3. Ajoutez vos textes et photos - Racontez votre histoire
4. Validez la configuration - Votre site est en ligne ! 🎉

💬 Besoin d'aide ?
Notre équipe est là pour vous accompagner.
support@laia-connect.fr

Bienvenue dans la famille LAIA Connect ! 💜
L'équipe LAIA Connect`,
    category: 'laia-connect',
    isActive: true
  },
  {
    id: 'welcome-laia',
    name: '🎉 Bienvenue LAIA Connect',
    subject: 'Bienvenue sur LAIA Connect - Votre partenaire digital',
    content: `Bonjour {nom},

Bienvenue sur LAIA Connect ! 🎉

Nous sommes ravis de vous accompagner dans la digitalisation de votre institut.

Votre accès est maintenant actif et vous pouvez commencer à :
✨ Gérer vos réservations en ligne
📅 Optimiser votre planning
💬 Communiquer avec vos clients
📊 Suivre vos statistiques

Notre équipe est à votre disposition pour vous accompagner.

Belle journée,
L'équipe LAIA Connect`,
    category: 'laia-connect',
    isActive: true
  }
];

export default function EmailTemplateManager() {
  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general'
  });

  // Combiner templates LAIA + templates custom
  const allTemplates = [...defaultLaiaTemplates, ...customTemplates];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/super-admin/email-templates');

      if (response.ok) {
        const data = await response.json();
        setCustomTemplates(data);
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTemplate
        ? `/api/super-admin/email-templates/${editingTemplate.id}`
        : '/api/super-admin/email-templates';

      const response = await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingTemplate ? '✅ Template modifié !' : '✅ Template créé !');
        setShowForm(false);
        setEditingTemplate(null);
        setFormData({ name: '', subject: '', content: '', category: 'general' });
        loadTemplates();
      } else {
        alert('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce template ?')) return;

    try {
      const response = await fetch(`/api/super-admin/email-templates/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Template supprimé !');
        loadTemplates();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const startEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category || 'general'
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', content: '', category: 'general' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gestion des Templates Email</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau template
        </button>
      </div>

      {/* Liste des templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {allTemplates.map(template => (
          <div key={template.id} className={`border rounded-lg p-4 transition-colors ${
            template.category === 'laia-connect'
              ? 'border-purple-300 bg-purple-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <FileText className={`w-5 h-5 ${template.category === 'laia-connect' ? 'text-purple-500' : 'text-blue-500'}`} />
              <div className="flex gap-2">
                {template.category === 'laia-connect' ? (
                  <span className="text-xs text-purple-600 font-medium px-2 py-1 bg-purple-100 rounded">
                    Template LAIA
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(template)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
            <span className={`text-xs px-2 py-1 rounded ${
              template.category === 'laia-connect'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {template.category === 'laia-connect' ? 'LAIA Connect' : template.category || 'général'}
            </span>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
                </h3>
                <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du template
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Ex: Bienvenue, Promo, Anniversaire..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Général</option>
                    <option value="appointment">Rendez-vous</option>
                    <option value="promotion">Promotion</option>
                    <option value="special">Spécial</option>
                    <option value="followup">Suivi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet de l'email
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Utilisez {name} pour personnaliser"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variables disponibles : {'{name}'}, {'{email}'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu HTML
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={12}
                    required
                    placeholder="Contenu HTML de l'email..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Utilisez le HTML inline pour la mise en forme
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingTemplate ? 'Modifier' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
