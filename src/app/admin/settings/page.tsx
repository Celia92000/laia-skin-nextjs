'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Lock, Mail, User, Shield,
  Eye, EyeOff, Check, X, AlertCircle, Settings as SettingsIcon, Globe, CreditCard,
  Building, MapPin, Phone
} from 'lucide-react';
import AdminConfigTab from '@/components/AdminConfigTab';
import SubscriptionInvoices from '@/components/SubscriptionInvoices';

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'site' | 'subscription'>('account');
  
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    role: ''
  });

  // Vérifier si l'utilisateur a accès complet (ORG_OWNER, SUPER_ADMIN)
  const hasFullAccess = ['ORG_ADMIN', 'SUPER_ADMIN'].includes(userInfo.role);

  // Vérifier si l'utilisateur est comptable (peut voir abonnement mais pas modifier)
  const isAccountant = userInfo.role === 'ACCOUNTANT';

  // Vérifier si l'utilisateur est staff (accès minimal)
  const isStaff = ['STAFF', 'RECEPTIONIST', 'LOCATION_MANAGER'].includes(userInfo.role);
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [orgInfo, setOrgInfo] = useState({
    name: '',
    legalName: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    siret: '',
    tvaNumber: '',
    billingEmail: '',
    billingAddress: '',
    billingPostalCode: '',
    billingCity: '',
    billingCountry: 'France',
  });

  const [editMode, setEditMode] = useState(false);
  const [saveOrgLoading, setSaveOrgLoading] = useState(false);
  const [saveOrgSuccess, setSaveOrgSuccess] = useState('');
  const [saveOrgError, setSaveOrgError] = useState('');

  useEffect(() => {
    fetchUserInfo();
    fetchOrgInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserInfo({
            email: data.user.email || '',
            name: data.user.name || '',
            role: data.user.role || ''
          });
        }
      }
    } catch (error) {
      console.error('Erreur récupération infos:', error);
    }
  };

  const fetchOrgInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/organization/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrgInfo({
          name: data.name || '',
          legalName: data.legalName || '',
          ownerFirstName: data.ownerFirstName || '',
          ownerLastName: data.ownerLastName || '',
          ownerEmail: data.ownerEmail || '',
          ownerPhone: data.ownerPhone || '',
          siret: data.siret || '',
          tvaNumber: data.tvaNumber || '',
          billingEmail: data.billingEmail || '',
          billingAddress: data.billingAddress || '',
          billingPostalCode: data.billingPostalCode || '',
          billingCity: data.billingCity || '',
          billingCountry: data.billingCountry || 'France',
        });
      }
    } catch (error) {
      console.error('Erreur récupération infos organisation:', error);
    }
  };

  const handleSaveOrgInfo = async () => {
    setSaveOrgLoading(true);
    setSaveOrgError('');
    setSaveOrgSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/organization/info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orgInfo)
      });

      if (response.ok) {
        setSaveOrgSuccess('Informations mises à jour avec succès !');
        setEditMode(false);
        setTimeout(() => setSaveOrgSuccess(''), 5000);
      } else {
        const data = await response.json();
        setSaveOrgError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      setSaveOrgError('Erreur lors de la sauvegarde');
    } finally {
      setSaveOrgLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Mot de passe modifié avec succès !');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-sm text-gray-600">Gérez votre compte et la configuration du site</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 pb-4 px-4 transition relative ${
              activeTab === 'account'
                ? 'text-[#d4b5a0] font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            Paramètres du compte
            {activeTab === 'account' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4b5a0]"></div>
            )}
          </button>

          {/* Configuration du site - Seulement pour ORG_OWNER, SUPER_ADMIN */}
          {hasFullAccess && (
            <button
              onClick={() => setActiveTab('site')}
              className={`flex items-center gap-2 pb-4 px-4 transition relative ${
                activeTab === 'site'
                  ? 'text-[#d4b5a0] font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Globe className="w-5 h-5" />
              Configuration du site
              {activeTab === 'site' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4b5a0]"></div>
              )}
            </button>
          )}

          {/* Abonnement - Seulement pour ORG_OWNER, SUPER_ADMIN, ACCOUNTANT */}
          {(hasFullAccess || isAccountant) && (
            <button
              onClick={() => setActiveTab('subscription')}
              className={`flex items-center gap-2 pb-4 px-4 transition relative ${
                activeTab === 'subscription'
                  ? 'text-[#d4b5a0] font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Abonnement
              {activeTab === 'subscription' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4b5a0]"></div>
              )}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'account' ? (
        <div className="max-w-4xl mx-auto grid gap-6">
          {/* Informations du compte */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informations du compte</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {userInfo.email}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Votre email professionnel pour la connexion
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Nom
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                {userInfo.name || 'Admin'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="inline w-4 h-4 mr-2" />
                Rôle
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {userInfo.role === 'ADMIN' ? 'Administrateur' : userInfo.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de l'organisation - Masqué pour STAFF/RECEPTIONIST/LOCATION_MANAGER */}
        {!isStaff && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Informations de l'organisation</h2>
              </div>
              {/* Bouton Modifier - Seulement pour ORG_OWNER, SUPER_ADMIN */}
              {!editMode && hasFullAccess && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 text-sm bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors"
                >
                  Modifier
                </button>
              )}
              {/* Badge lecture seule pour ACCOUNTANT */}
              {isAccountant && (
                <span className="text-xs px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                  Lecture seule
                </span>
              )}
            </div>

          {saveOrgSuccess && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{saveOrgSuccess}</p>
            </div>
          )}

          {saveOrgError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <X className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{saveOrgError}</p>
            </div>
          )}

          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'organisation
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {orgInfo.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison sociale
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={orgInfo.legalName}
                    onChange={(e) => setOrgInfo({ ...orgInfo, legalName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="LAIA SKIN SARL"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {orgInfo.legalName || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={orgInfo.siret}
                    onChange={(e) => setOrgInfo({ ...orgInfo, siret: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="123 456 789 00012"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-mono">
                    {orgInfo.siret || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° TVA intracommunautaire
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={orgInfo.tvaNumber}
                    onChange={(e) => setOrgInfo({ ...orgInfo, tvaNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="FR 12 123456789"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-mono">
                    {orgInfo.tvaNumber || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Informations du propriétaire - Masqué pour STAFF/RECEPTIONIST/LOCATION_MANAGER */}
        {!isStaff && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Propriétaire de l'organisation</h2>
                {isAccountant && (
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
                    Lecture seule
                  </span>
                )}
              </div>
            </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={orgInfo.ownerFirstName}
                    onChange={(e) => setOrgInfo({ ...orgInfo, ownerFirstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {orgInfo.ownerFirstName || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={orgInfo.ownerLastName}
                    onChange={(e) => setOrgInfo({ ...orgInfo, ownerLastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {orgInfo.ownerLastName || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={orgInfo.ownerEmail}
                    onChange={(e) => setOrgInfo({ ...orgInfo, ownerEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {orgInfo.ownerEmail || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Téléphone
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={orgInfo.ownerPhone}
                    onChange={(e) => setOrgInfo({ ...orgInfo, ownerPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {orgInfo.ownerPhone || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Informations de facturation - Masqué pour STAFF/RECEPTIONIST/LOCATION_MANAGER */}
        {!isStaff && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Facturation</h2>
                <p className="text-xs text-gray-500">
                  Si différente de l'adresse de l'institut
                  {isAccountant && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
                      Lecture seule
                    </span>
                  )}
                </p>
              </div>
            </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de facturation
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={orgInfo.billingEmail}
                    onChange={(e) => setOrgInfo({ ...orgInfo, billingEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Laisser vide pour utiliser l'email principal"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {orgInfo.billingEmail || '-'}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Adresse de facturation
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={orgInfo.billingAddress}
                    onChange={(e) => setOrgInfo({ ...orgInfo, billingAddress: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Laisser vide pour utiliser l'adresse de l'institut"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {orgInfo.billingAddress || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={orgInfo.billingPostalCode}
                    onChange={(e) => setOrgInfo({ ...orgInfo, billingPostalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {orgInfo.billingPostalCode || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={orgInfo.billingCity}
                    onChange={(e) => setOrgInfo({ ...orgInfo, billingCity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {orgInfo.billingCity || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {editMode && (
            <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={handleSaveOrgInfo}
                disabled={saveOrgLoading}
                className="flex-1 px-4 py-3 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saveOrgLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  fetchOrgInfo();
                }}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
        )}

        {/* Changement de mot de passe */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#d4b5a0]/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#d4b5a0]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
          </div>

          {/* Messages */}
          {success && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <X className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 caractères
              </p>
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#d4b5a0] text-white rounded-lg font-medium hover:bg-[#c9a084] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Changer le mot de passe
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Conseils de sécurité :</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Utilisez un mot de passe unique pour ce compte</li>
                  <li>Incluez des lettres majuscules, minuscules et des chiffres</li>
                  <li>Changez votre mot de passe régulièrement</li>
                  <li>Ne partagez jamais votre mot de passe</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : activeTab === 'site' ? (
        <div className="max-w-7xl mx-auto">
          <AdminConfigTab />
        </div>
      ) : activeTab === 'subscription' ? (
        <div className="max-w-7xl mx-auto">
          <SubscriptionInvoices />
        </div>
      ) : null}
    </div>
  );
}