'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, Check, Settings,
  Globe, Phone, Building, MessageCircle, Palette, Layout,
  Clock, FileText, Eye, Map, Search, Star, Zap, Key,
  Smartphone, Mail, CreditCard, Image as ImageIcon, User
} from 'lucide-react';
import AdminConfigTab from '@/components/AdminConfigTab';

// Définition des étapes du wizard
const wizardSteps = [
  {
    id: 1,
    title: 'Informations de base',
    description: 'Nom de l\'institut, coordonnées, informations légales',
    icon: Building,
    tabs: ['general', 'contact', 'company'] as const,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 2,
    title: 'Apparence & Design',
    description: 'Couleurs, template, logo, style visuel',
    icon: Palette,
    tabs: ['appearance', 'template'] as const,
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 3,
    title: 'Contenu du site',
    description: 'Page d\'accueil, textes, galerie photo',
    icon: FileText,
    tabs: ['homepage', 'content', 'gallery', 'about'] as const,
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 4,
    title: 'Localisation & Horaires',
    description: 'Adresse, carte, horaires d\'ouverture',
    icon: Map,
    tabs: ['location', 'hours'] as const,
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 5,
    title: 'Réseaux sociaux',
    description: 'Instagram, Facebook, TikTok, WhatsApp',
    icon: MessageCircle,
    tabs: ['social'] as const,
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 6,
    title: 'SEO & Référencement',
    description: 'Optimisation moteurs de recherche, Google Business',
    icon: Search,
    tabs: ['seo', 'google'] as const,
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 7,
    title: 'Intégrations & Communications',
    description: 'SMS, Email, WhatsApp, outils externes',
    icon: Zap,
    tabs: ['integrations', 'sms', 'email', 'whatsapp'] as const,
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 8,
    title: 'Finances & Sécurité',
    description: 'Informations bancaires, API, accès sécurisés',
    icon: CreditCard,
    tabs: ['finances', 'api'] as const,
    color: 'from-emerald-500 to-green-600'
  }
];

export default function OnboardingSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<any>('general');

  useEffect(() => {
    // Charger la progression sauvegardée
    const savedProgress = localStorage.getItem('laia-onboarding-progress');
    if (savedProgress) {
      try {
        const { step, completed } = JSON.parse(savedProgress);
        setCurrentStep(step);
        setCompletedSteps(completed);
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Sauvegarder la progression
    localStorage.setItem('laia-onboarding-progress', JSON.stringify({
      step: currentStep,
      completed: completedSteps
    }));

    // Définir le tab actif basé sur l'étape actuelle
    const step = wizardSteps.find(s => s.id === currentStep);
    if (step && step.tabs.length > 0) {
      setActiveTab(step.tabs[0]);
    }
  }, [currentStep, completedSteps]);

  const currentStepData = wizardSteps.find(s => s.id === currentStep);
  const totalSteps = wizardSteps.length;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Marquer l'étape actuelle comme complétée
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Marquer l'onboarding comme terminé
    localStorage.setItem('laia-quick-setup-completed', 'true');
    localStorage.removeItem('laia-onboarding-progress');
    router.push('/admin/settings?tab=site');
  };

  const handleSkip = () => {
    if (confirm('Êtes-vous sûr de vouloir passer cette étape ? Vous pourrez toujours la compléter plus tard.')) {
      handleNext();
    }
  };

  if (!currentStepData) {
    return null;
  }

  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${currentStepData.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <StepIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Configuration complète
                </h1>
                <p className="text-sm text-gray-500">
                  Étape {currentStep} sur {totalSteps} - {currentStepData.title}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/admin/settings?tab=site')}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Quitter et enregistrer
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${currentStepData.color} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar - Navigation des étapes */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Progression</h3>
              <div className="space-y-3">
                {wizardSteps.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = step.id === currentStep;
                  const isPast = step.id < currentStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r ' + step.color + ' text-white shadow-lg'
                          : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        isCurrent ? 'bg-white/20' : isCompleted ? 'bg-green-200' : 'bg-gray-200'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`text-xs font-medium ${isCurrent ? 'opacity-80' : ''}`}>
                          Étape {step.id}
                        </div>
                        <div className="text-sm font-semibold line-clamp-1">
                          {step.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main content - Configuration actuelle */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Titre de l'étape */}
              <div className="mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${currentStepData.color} text-white rounded-full text-sm font-medium mb-4`}>
                  <StepIcon className="w-4 h-4" />
                  Étape {currentStep} sur {totalSteps}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-gray-600">
                  {currentStepData.description}
                </p>
              </div>

              {/* Configuration tabs */}
              <AdminConfigTab />

              {/* Navigation buttons */}
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Précédent
                </button>

                <div className="flex items-center gap-3">
                  {currentStep < totalSteps && (
                    <button
                      onClick={handleSkip}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Passer
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium shadow-lg transition ${
                      currentStep === totalSteps
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl'
                        : `bg-gradient-to-r ${currentStepData.color} hover:shadow-xl`
                    }`}
                  >
                    {currentStep === totalSteps ? (
                      <>
                        <Check className="w-5 h-5" />
                        Terminer la configuration
                      </>
                    ) : (
                      <>
                        Suivant
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
