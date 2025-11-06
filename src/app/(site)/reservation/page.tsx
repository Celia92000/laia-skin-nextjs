"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, User, Phone, Mail, ChevronLeft, ChevronRight, Sparkles, CheckCircle, MapPin, Shield, AlertCircle, Lock, Eye, EyeOff, Gift } from "lucide-react";
import { getDisplayPrice, getForfaitDisplayPrice, hasPromotion, getDiscountPercentage } from '@/lib/price-utils';
import { formatDateLocal } from "@/lib/date-utils";

function ReservationContent() {
  const searchParams = useSearchParams();
  const rescheduleId = searchParams.get('reschedule'); // ID de la réservation à reprogrammer
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<{[key: string]: string}>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    password: "",
    confirmPassword: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [hasAccount, setHasAccount] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const hasChanges = useRef(false);
  const isSubmittingRef = useRef(false);

  // États pour carte cadeau
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardData, setGiftCardData] = useState<any>(null);
  const [isCheckingGiftCard, setIsCheckingGiftCard] = useState(false);
  const [giftCardError, setGiftCardError] = useState("");

  // Pré-remplir le code de la carte cadeau depuis l'URL
  useEffect(() => {
    const urlGiftCard = searchParams.get('giftCard');
    if (urlGiftCard) {
      setGiftCardCode(urlGiftCard.toUpperCase());
      // Vérifier automatiquement la carte
      setTimeout(() => {
        const checkCard = async () => {
          setIsCheckingGiftCard(true);
          setGiftCardError("");
          try {
            const response = await fetch(`/api/gift-cards?code=${encodeURIComponent(urlGiftCard.toUpperCase())}`);
            const data = await response.json();
            if (response.ok && data.valid) {
              setGiftCardData(data);
            } else {
              setGiftCardError(data.error || "Code invalide");
            }
          } catch (error) {
            setGiftCardError("Erreur lors de la vérification du code");
          } finally {
            setIsCheckingGiftCard(false);
          }
        };
        checkCard();
      }, 500);
    }
  }, [searchParams]);

  // Charger les services depuis la base de données
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        const formattedServices = data
          .filter((service: any) => service.active && service.category !== 'forfaits')
          .map((service: any) => ({
            id: service.id,
            slug: service.slug,
            name: service.name,
            description: service.shortDescription || service.description,
            duration: `${service.duration} min`,
            price: service.price,
            promoPrice: service.promoPrice,
            forfaitPrice: service.forfaitPrice,
            forfaitPromo: service.forfaitPromo,
            forfait: service.forfaitPrice && service.forfaitPrice > 0, // Ajouter le champ forfait
            displayPrice: getDisplayPrice(service),
            forfaitDisplayPrice: getForfaitDisplayPrice(service),
            hasPromo: hasPromotion(service),
            discountPercent: hasPromotion(service) ? getDiscountPercentage(service.price, service.promoPrice) : 0,
            icon: service.slug === 'hydro-naissance' ? "👑" :
                  service.slug === 'hydro-cleaning' ? "💧" :
                  service.slug === 'renaissance' ? "✨" :
                  service.slug === 'bb-glow' ? "🌟" : "💡",
            recommended: service.featured || false,
            order: service.order || 999
          }))
          .sort((a: any, b: any) => {
            // D'abord trier par featured (recommandé)
            if (a.recommended && !b.recommended) return -1;
            if (!a.recommended && b.recommended) return 1;
            // Ensuite par ordre
            return a.order - b.order;
          });
        setServices(formattedServices);
      })
      .catch(err => {
        console.error('Erreur lors du chargement des services:', err);
        // Fallback aux données par défaut en cas d'erreur
        setServices([]);
      });
  }, []);

  // Charger les détails de la réservation à reprogrammer
  useEffect(() => {
    if (rescheduleId) {
      const fetchReservationDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/reservations/${rescheduleId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const reservation = await response.json();
            // Préfiller les services sélectionnés
            if (reservation.services) {
              const serviceList = typeof reservation.services === 'string'
                ? JSON.parse(reservation.services)
                : reservation.services;
              setSelectedServices(serviceList);
            }
            // Préfiller les informations du client si connecté
            if (reservation.user) {
              setFormData(prev => ({
                ...prev,
                name: reservation.user.name || '',
                email: reservation.user.email || '',
                phone: reservation.user.phone || ''
              }));
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la réservation:', error);
        }
      };
      fetchReservationDetails();
    }
  }, [rescheduleId]);

  // Charger les dates bloquées
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        // Récupérer les dates bloquées pour le mois courant et le suivant
        const currentMonth = await fetch(`/api/public/availability?action=blocked&year=${year}&month=${month}`);
        const nextMonth = await fetch(`/api/public/availability?action=blocked&year=${year}&month=${month + 1}`);
        
        const [currentData, nextData] = await Promise.all([
          currentMonth.json(),
          nextMonth.json()
        ]);
        
        const allBlockedDates = [...(currentData.blockedDates || []), ...(nextData.blockedDates || [])];
        setBlockedDates(allBlockedDates);
      } catch (error) {
        console.error('Erreur lors du chargement des dates bloquées:', error);
      }
    };
    
    fetchBlockedDates();
  }, []);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
    "21:00", "21:30", "22:00", "22:30", "23:00"
  ];

  // Gérer les paramètres d'URL pour pré-sélectionner services et options
  useEffect(() => {
    const service = searchParams.get('service');
    const packageType = searchParams.get('package');
    const option = searchParams.get('option');
    
    if (service) {
      // Les services arrivent déjà avec les bons IDs depuis les pages de prestations
      setSelectedServices([service]);
      // Gérer le type de package selon le paramètre URL
      if (packageType === 'forfait') {
        setSelectedPackages({[service]: 'forfait'});
      } else if (packageType === 'abonnement') {
        setSelectedPackages({[service]: 'abonnement'});
      } else {
        setSelectedPackages({[service]: 'single'});
      }
    }
    if (option) {
      setSelectedOptions([option]);
    }
  }, [searchParams]);

  // Vérifier si l'utilisateur est déjà connecté ou a ses identifiants sauvegardés
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const userInfo = JSON.parse(user);
      setIsLoggedIn(true);
      setFormData(prev => ({
        ...prev,
        name: userInfo.name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || ''
      }));
    } else {
      // Charger les identifiants sauvegardés si "Se souvenir de moi" était coché
      const savedEmail = localStorage.getItem('rememberEmail');
      const savedPassword = localStorage.getItem('rememberPassword');
      const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
      
      if (savedEmail && savedPassword && savedRememberMe) {
        setFormData(prev => ({
          ...prev,
          email: savedEmail,
          password: atob(savedPassword) // Décodage
        }));
        setRememberMe(true);
        setHasAccount(true); // Basculer automatiquement sur "J'ai déjà un compte"
      }
    }
  }, []);

  // Vérifier la disponibilité des créneaux quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedServices]); // Refetch quand les services changent aussi

  // Détecter les changements dans le formulaire
  useEffect(() => {
    if (selectedServices.length > 0 || selectedDate || selectedTime || 
        formData.name || formData.email || formData.phone || formData.notes) {
      hasChanges.current = true;
    } else {
      hasChanges.current = false;
    }
  }, [selectedServices, selectedDate, selectedTime, formData]);

  // Prévenir la fermeture accidentelle de la page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Ne pas afficher le message si on est en train de soumettre le formulaire
      if (hasChanges.current && !isSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter cette page ?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      // Calculer la durée totale des services sélectionnés
      let totalDuration = 0;
      if (selectedServices.length > 0) {
        selectedServices.forEach(serviceId => {
          const service = services.find(s => s.id === serviceId);
          if (service) {
            // Extraire la durée du service (ex: "60 min" -> 60)
            const duration = parseInt(service.duration) || 60;
            totalDuration += duration;
          }
        });
        // Ajouter 15 minutes de préparation
        totalDuration += 15;
      } else {
        // Par défaut si aucun service sélectionné: 60 + 15 min
        totalDuration = 75;
      }

      const response = await fetch(`/api/public/availability?action=slots&date=${selectedDate}&duration=${totalDuration}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
    }
  };

  const isSlotAvailable = (time: string) => {
    const slot = availableSlots.find(s => s.time === time);
    return slot ? slot.available : true; // Par défaut disponible si pas encore chargé
  };

  const isDateBlocked = (dateString: string) => {
    return blockedDates.includes(dateString);
  };

  const updateBlockedDatesForMonth = async (year: number, month: number) => {
    try {
      // Récupérer les dates bloquées pour le mois demandé et les mois adjacents
      const responses = await Promise.all([
        fetch(`/api/public/availability?action=blocked&year=${year}&month=${month - 1}`),
        fetch(`/api/public/availability?action=blocked&year=${year}&month=${month}`),
        fetch(`/api/public/availability?action=blocked&year=${year}&month=${month + 1}`)
      ]);
      
      const data = await Promise.all(responses.map(r => r.json()));
      const allBlockedDates = data.flatMap(d => d.blockedDates || []);
      
      setBlockedDates(allBlockedDates);
    } catch (error) {
      console.error('Erreur lors du chargement des dates bloquées:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    isSubmittingRef.current = true; // Marquer qu'on est en train de soumettre
    
    try {
      // Vérifier que la date n'est pas bloquée
      if (isDateBlocked(selectedDate)) {
        alert("Cette date n'est plus disponible. Veuillez en choisir une autre.");
        setIsSubmitting(false);
        setStep(2); // Retour à la sélection de la date
        return;
      }
      
      // Vérifier une dernière fois la disponibilité
      const checkResponse = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, time: selectedTime })
      });
      
      const checkData = await checkResponse.json();
      
      if (!checkData.available) {
        alert("Désolé, ce créneau vient d'être réservé. Veuillez en choisir un autre.");
        setIsSubmitting(false);
        setStep(2); // Retour à la sélection de l'heure
        fetchAvailableSlots(); // Rafraîchir les créneaux
        return;
      }
      
      let token = localStorage.getItem('token');
      console.log('Token existant:', token);
      
      // Si pas connecté, créer un compte ou se connecter
      if (!token) {
        console.log('Pas de token, tentative de connexion/création de compte');
        if (hasAccount) {
          // Connexion avec identifiants existants
          console.log('Tentative de connexion avec:', formData.email);
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              rememberMe: rememberMe
            })
          });
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('Connexion réussie, token reçu:', loginData.token);
            
            // Si "Se souvenir de moi" est coché, stocker les identifiants
            if (rememberMe) {
              localStorage.setItem('rememberEmail', formData.email);
              localStorage.setItem('rememberPassword', btoa(formData.password)); // Encodage basique
              localStorage.setItem('rememberMe', 'true');
            } else {
              // Supprimer les identifiants sauvegardés si pas coché
              localStorage.removeItem('rememberEmail');
              localStorage.removeItem('rememberPassword');
              localStorage.removeItem('rememberMe');
            }
            
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            token = loginData.token;
          } else {
            const error = await loginResponse.text();
            console.error('Erreur de connexion:', error);
            alert("Email ou mot de passe incorrect");
            setIsSubmitting(false);
            return;
          }
        } else {
          // Créer un nouveau compte automatiquement avec un mot de passe aléatoire
          const randomPassword = Math.random().toString(36).slice(-8) + '123'; // Génère un mot de passe aléatoire
          console.log('Création de compte pour:', formData.email);
          
          const registerResponse = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: randomPassword, // Mot de passe aléatoire généré automatiquement
              name: formData.name,
              phone: formData.phone
            })
          });
          
          if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            console.log('Compte créé, token reçu:', registerData.token);
            localStorage.setItem('token', registerData.token);
            localStorage.setItem('user', JSON.stringify(registerData.user));
            token = registerData.token;
            // Informer l'utilisateur que le compte a été créé
            alert(`Votre compte a été créé avec succès ! Un email de confirmation vous sera envoyé avec vos identifiants.`);
          } else {
            const error = await registerResponse.json();
            if (error.error === 'Cet email est déjà utilisé') {
              alert("Cet email est déjà enregistré. Veuillez vous connecter avec votre mot de passe.");
              setHasAccount(true);
              setIsSubmitting(false);
              return;
            }
            alert("Erreur lors de la création du compte");
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Créer la réservation
      console.log('Création de la réservation');
      const reservationData = {
        services: selectedServices,
        packages: selectedPackages,
        date: selectedDate,
        time: selectedTime,
        notes: formData.notes,
        totalPrice: calculateTotal(),
        // Informations carte cadeau
        ...(giftCardData ? {
          giftCardCode: giftCardData.code,
          giftCardUsedAmount: getGiftCardUsedAmount()
        } : {}),
        // Ajouter les infos client si pas de token
        ...(!token ? {
          clientInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        } : {})
      };
      console.log('Données de réservation:', reservationData);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // Ajouter le token seulement s'il existe
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers,
        body: JSON.stringify(reservationData)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Réservation créée avec succès:', responseData);

        // Si c'est une reprogrammation, annuler l'ancienne réservation
        if (rescheduleId && token) {
          try {
            await fetch(`/api/reservations/${rescheduleId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('Ancienne réservation annulée');
          } catch (error) {
            console.error('Erreur lors de l\'annulation de l\'ancienne réservation:', error);
          }
        }

        // Réinitialiser le flag de changements avant la redirection
        hasChanges.current = false;
        // Rediriger vers la page de confirmation
        window.location.href = `/confirmation?id=${responseData.id}`;
      } else if (response.status === 409) {
        alert("Ce créneau est déjà pris. Veuillez en choisir un autre.");
        setStep(2);
        fetchAvailableSlots();
      } else {
        const errorText = await response.text();
        console.error('Erreur de réservation:', errorText);
        alert("Erreur lors de la réservation. Veuillez réessayer.");
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false; // Réinitialiser le flag après la soumission
    }
  };
  
  // Vérifier la carte cadeau
  const checkGiftCard = async () => {
    if (!giftCardCode.trim()) {
      setGiftCardError("Veuillez entrer un code");
      return;
    }

    setIsCheckingGiftCard(true);
    setGiftCardError("");
    setGiftCardData(null);

    try {
      const response = await fetch(`/api/gift-cards?code=${encodeURIComponent(giftCardCode.toUpperCase())}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setGiftCardData(data);
        setGiftCardError("");
      } else {
        setGiftCardError(data.error || "Code invalide");
        setGiftCardData(null);
      }
    } catch (error) {
      setGiftCardError("Erreur lors de la vérification du code");
      setGiftCardData(null);
    } finally {
      setIsCheckingGiftCard(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;

    // Calculer le prix des services sélectionnés
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        const packageType = selectedPackages[serviceId] || 'single';

        // Convertir tous les prix en nombres
        let priceToAdd = 0;

        if (packageType === 'forfait') {
          priceToAdd = Number(service.forfaitDisplayPrice) || Number(service.forfaitPrice) || 0;
        } else {
          // Séance individuelle (single)
          priceToAdd = Number(service.displayPrice) || Number(service.price) || 0;
        }

        console.log(`Service ${service.name} (${packageType}): ${priceToAdd}€`);
        total = total + priceToAdd;
      }
    });

    // Ajouter le prix des options (50€ chacune)
    if (selectedOptions && selectedOptions.length > 0) {
      selectedOptions.forEach(optionId => {
        if (optionId === "bb-glow" || optionId === "led-therapie") {
          total = total + 50;
        }
      });
    }

    return Math.round(total);
  };

  // Calculer le montant restant après déduction de la carte cadeau
  const calculateAmountToPay = () => {
    const total = calculateTotal();
    if (giftCardData && giftCardData.balance > 0) {
      const amountAfterGiftCard = total - giftCardData.balance;
      return amountAfterGiftCard > 0 ? amountAfterGiftCard : 0;
    }
    return total;
  };

  // Calculer le montant utilisé de la carte cadeau
  const getGiftCardUsedAmount = () => {
    const total = calculateTotal();
    if (giftCardData && giftCardData.balance > 0) {
      return Math.min(giftCardData.balance, total);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-36 pb-16 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-[#d4b5a0]" />
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2c3e50] animate-fade-in-up">
              {rescheduleId ? 'Reprogrammation' : 'Réservation en ligne'}
            </h1>
            <Sparkles className="w-8 h-8 text-[#d4b5a0]" />
          </div>

          {rescheduleId && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">
                  Vous êtes en train de reprogrammer votre rendez-vous. L'ancien rendez-vous sera automatiquement annulé.
                </p>
              </div>
            </div>
          )}
          <p className="text-xl text-[#2c3e50]/80 mb-8 animate-fade-in-up animation-delay-200">
            Réservez votre soin en quelques clics et offrez-vous un moment d'exception
          </p>
        </div>
      </section>

      <main className="pb-20">
        <div className="max-w-4xl mx-auto px-4">

          {/* Progress Steps */}
          <div className="flex justify-center mb-8 sm:mb-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {[
                { num: 1, label: "Soin", icon: Sparkles },
                { num: 2, label: "Date", icon: Calendar },
                { num: 3, label: "Contact", icon: User }
              ].map(({ num, label, icon: Icon }) => (
                <div key={num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-semibold transition-all duration-300 shadow-lg ${
                        step >= num
                          ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-[#d4b5a0]/50"
                          : "bg-white border-2 border-gray-200 text-gray-500"
                      }`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className={`text-xs sm:text-sm mt-1 sm:mt-2 font-medium ${
                      step >= num ? "text-[#d4b5a0]" : "text-gray-400"
                    }`}>
                      {label}
                    </span>
                  </div>
                  {num < 3 && (
                    <div
                      className={`w-12 sm:w-24 h-0.5 sm:h-1 mx-2 sm:mx-6 rounded-full transition-all duration-300 ${
                        step > num ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-[#d4b5a0]/10">
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-3">Choisissez votre soin</h2>
                  <p className="text-[#2c3e50]/70">Sélectionnez le soin qui correspond à vos besoins</p>
                </div>
                <div className="space-y-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`relative border-2 rounded-2xl transition-all duration-300 ${
                        selectedServices.includes(service.id)
                          ? "border-[#d4b5a0] bg-gradient-to-br from-[#d4b5a0]/5 to-[#c9a084]/5 shadow-lg"
                          : service.recommended
                          ? "border-[#d4b5a0]/50 bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10"
                          : "border-gray-200 hover:border-[#d4b5a0]/30"
                      }`}
                    >
                      {service.recommended && (
                        <span className="absolute -top-3 left-6 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-4 py-1 text-sm rounded-full font-semibold z-10">
                          ⭐ Recommandé
                        </span>
                      )}
                      
                      {/* Checkbox et infos du service */}
                      <div className="p-6">
                        <label className="flex items-start gap-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                let newServices = [...selectedServices];
                                
                                // Si on sélectionne Hydro'Naissance, on retire Hydro'Cleaning et Renaissance
                                if (service.id === "hydro-naissance") {
                                  newServices = newServices.filter(id => id !== "hydro-cleaning" && id !== "renaissance");
                                }
                                
                                // Si on sélectionne Hydro'Cleaning ou Renaissance, on retire Hydro'Naissance
                                if (service.id === "hydro-cleaning" || service.id === "renaissance") {
                                  newServices = newServices.filter(id => id !== "hydro-naissance");
                                  
                                  // Si l'autre est déjà sélectionné, proposer Hydro'Naissance
                                  if ((service.id === "hydro-cleaning" && newServices.includes("renaissance")) ||
                                      (service.id === "renaissance" && newServices.includes("hydro"))) {
                                    if (confirm("Vous avez sélectionné Hydro'Cleaning et Renaissance. Voulez-vous plutôt choisir le soin combiné Hydro'Naissance qui est plus avantageux ?")) {
                                      newServices = ["hydro-naissance"];
                                      setSelectedPackages({"hydro-naissance": "single"});
                                    } else {
                                      newServices.push(service.id);
                                    }
                                  } else {
                                    newServices.push(service.id);
                                  }
                                } else {
                                  newServices.push(service.id);
                                }
                                
                                setSelectedServices(newServices);
                                // Toujours ajouter le package single par défaut pour les nouveaux services
                                const updatedPackages = {...selectedPackages};
                                newServices.forEach(sid => {
                                  if (!updatedPackages[sid]) {
                                    updatedPackages[sid] = "single";
                                  }
                                });
                                setSelectedPackages(updatedPackages);
                              } else {
                                setSelectedServices(selectedServices.filter(id => id !== service.id));
                                const newPackages = {...selectedPackages};
                                delete newPackages[service.id];
                                setSelectedPackages(newPackages);
                              }
                            }}
                            className="mt-1 w-5 h-5 text-[#d4b5a0] focus:ring-[#d4b5a0] rounded"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-serif font-semibold text-xl text-[#2c3e50] mb-1">{service.name} {service.icon}</h3>
                                <p className="text-[#2c3e50]/70 mb-2">{service.description}</p>
                                <p className="text-sm text-[#2c3e50]/60 flex items-center">
                                  <Clock className="inline w-4 h-4 mr-1" />
                                  {service.duration}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-right">
                                  <div className="flex items-baseline gap-2 justify-end">
                                    <span className="text-3xl font-bold text-[#d4b5a0]">{service.displayPrice}€</span>
                                    {service.hasPromo && (
                                      <>
                                        <span className="text-lg line-through text-gray-400">{service.price}€</span>
                                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">-{service.discountPercent}%</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {selectedServices.includes(service.id) && (
                                  <CheckCircle className="w-6 h-6 text-[#d4b5a0] mt-2 ml-auto" />
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      {/* Choix forfait intégré - visible seulement si service sélectionné */}
                      {selectedServices.includes(service.id) && service.forfait && (
                        <div className="px-6 pb-6 -mt-2 animate-fade-in-down">
                          <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-xl p-4 border border-[#d4b5a0]/20">
                            <h4 className="font-medium text-[#2c3e50] mb-3 flex items-center">
                              <Sparkles className="w-4 h-4 mr-2 text-[#d4b5a0]" />
                              Choisissez votre formule
                            </h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              <label className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedPackages[service.id] === "single" 
                                  ? "border-[#d4b5a0] bg-white shadow-md" 
                                  : "border-gray-200 hover:border-[#d4b5a0]/50"
                              }`}>
                                <input
                                  type="radio"
                                  name={`package-${service.id}`}
                                  value="single"
                                  checked={selectedPackages[service.id] === "single"}
                                  onChange={(e) => setSelectedPackages({...selectedPackages, [service.id]: e.target.value})}
                                  className="hidden"
                                />
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h5 className="font-semibold text-sm text-[#2c3e50]">Séance unique</h5>
                                    <p className="text-xs text-[#2c3e50]/60 mt-1">Découvrir le soin</p>
                                  </div>
                                  <span className="text-lg font-bold text-[#d4b5a0]">
                                    {service.displayPrice}€
                                  </span>
                                </div>
                              </label>
                              
                              <label className={`p-3 border-2 rounded-lg cursor-pointer transition-all relative ${
                                selectedPackages[service.id] === "forfait" 
                                  ? "border-[#d4b5a0] bg-white shadow-md" 
                                  : "border-gray-200 hover:border-[#d4b5a0]/50"
                              }`}>
                                {(service.id === "hydro-cleaning" || service.id === "renaissance") && (
                                  <span className="absolute -top-2 right-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-2 py-0.5 text-xs rounded-full font-semibold">
                                    -20€
                                  </span>
                                )}
                                {service.id === "led-therapie" && (
                                  <span className="absolute -top-2 right-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-2 py-0.5 text-xs rounded-full font-semibold">
                                    -40€
                                  </span>
                                )}
                                {service.id === "hydro-naissance" && (
                                  <span className="absolute -top-2 right-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-2 py-0.5 text-xs rounded-full font-semibold">
                                    Économie
                                  </span>
                                )}
                                <input
                                  type="radio"
                                  name={`package-${service.id}`}
                                  value="forfait"
                                  checked={selectedPackages[service.id] === "forfait"}
                                  onChange={(e) => setSelectedPackages({...selectedPackages, [service.id]: e.target.value})}
                                  className="hidden"
                                />
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h5 className="font-semibold text-sm text-[#2c3e50]">Forfait 4 séances</h5>
                                    <p className="text-xs text-[#2c3e50]/60 mt-1">Résultats optimaux</p>
                                  </div>
                                  <span className="text-lg font-bold text-green-600">
                                    {service.forfaitDisplayPrice}€
                                  </span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Section Options complémentaires */}
                {selectedServices.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl border border-[#d4b5a0]/20">
                    <h3 className="text-xl font-serif font-bold text-[#2c3e50] mb-4">
                      Options complémentaires
                    </h3>
                    <p className="text-sm text-[#2c3e50]/70 mb-4">
                      Ajoutez ces soins pour compléter votre expérience
                    </p>
                    <div className="space-y-3">
                      {/* BB Glow en option (sauf si déjà sélectionné comme soin principal) */}
                      {!selectedServices.includes("bb-glow") && (
                        <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedOptions.includes("bb-glow")
                            ? "border-[#d4b5a0] bg-[#d4b5a0]/5"
                            : "border-gray-200 hover:border-[#d4b5a0]/50"
                        }`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedOptions.includes("bb-glow")}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOptions([...selectedOptions, "bb-glow"]);
                                } else {
                                  setSelectedOptions(selectedOptions.filter(id => id !== "bb-glow"));
                                }
                              }}
                              className="w-5 h-5 text-[#d4b5a0] focus:ring-[#d4b5a0] focus:ring-offset-0 rounded"
                            />
                            <div>
                              <h4 className="font-medium text-[#2c3e50]">BB Glow 🌟</h4>
                              <p className="text-xs text-[#2c3e50]/60">Teint lumineux semi-permanent (+30 min)</p>
                            </div>
                          </div>
                          <span className="font-bold text-[#d4b5a0]">+50€</span>
                        </label>
                      )}
                      
                      {/* LED Thérapie en option (sauf si déjà sélectionnée comme soin principal ou si incluse dans hydro-cleaning, hydro-naissance ou renaissance) */}
                      {!selectedServices.includes("led-therapie") && 
                       !selectedServices.includes("hydro-cleaning") && 
                       !selectedServices.includes("hydro-naissance") && 
                       !selectedServices.includes("renaissance") && (
                        <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedOptions.includes("led-therapie")
                            ? "border-[#d4b5a0] bg-[#d4b5a0]/5"
                            : "border-gray-200 hover:border-[#d4b5a0]/50"
                        }`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedOptions.includes("led-therapie")}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOptions([...selectedOptions, "led-therapie"]);
                                } else {
                                  setSelectedOptions(selectedOptions.filter(id => id !== "led-therapie"));
                                }
                              }}
                              className="w-5 h-5 text-[#d4b5a0] focus:ring-[#d4b5a0] focus:ring-offset-0 rounded"
                            />
                            <div>
                              <h4 className="font-medium text-[#2c3e50]">LED Thérapie 💡</h4>
                              <p className="text-xs text-[#2c3e50]/60">Régénération cellulaire (+30 min)</p>
                            </div>
                          </div>
                          <span className="font-bold text-[#d4b5a0]">+50€</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Total Price Display */}
                {selectedServices.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] rounded-xl text-white">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total :</span>
                      <span className="text-2xl font-bold">{calculateTotal()}€</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={selectedServices.length === 0}
                  className="mt-8 w-full py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  Continuer
                  <ChevronRight className="inline w-5 h-5 ml-2" />
                </button>
              </div>
            )}

            {/* Step 2: Date and Time */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-3">Choisissez la date et l'heure</h2>
                  <p className="text-[#2c3e50]/70">Sélectionnez votre créneau préféré</p>
                </div>
                
                <div className="mb-8">
                  <label className="flex items-center text-lg font-medium text-[#2c3e50] mb-3">
                    <Calendar className="w-5 h-5 mr-2 text-[#d4b5a0]" />
                    Date souhaitée
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      if (!isDateBlocked(newDate)) {
                        setSelectedDate(newDate);
                        setSelectedTime(""); // Réinitialiser l'heure sélectionnée
                      } else {
                        alert("Cette date n'est pas disponible. Veuillez choisir une autre date.");
                      }
                    }}
                    min={formatDateLocal(new Date())}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#d4b5a0] focus:outline-none transition-colors text-lg"
                  />
                  {blockedDates.length > 0 && (
                    <p className="text-sm text-[#2c3e50]/60 mt-2">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Certaines dates peuvent être indisponibles. Si vous ne pouvez pas sélectionner une date, c'est qu'elle est bloquée.
                    </p>
                  )}
                </div>

                {selectedDate && (
                  <div className="mb-8">
                    <label className="flex items-center text-lg font-medium text-[#2c3e50] mb-4">
                      <Clock className="w-5 h-5 mr-2 text-[#d4b5a0]" />
                      Créneau horaire
                    </label>
                    
                    {/* Alerte si peu de créneaux disponibles */}
                    {availableSlots.length > 0 && availableSlots.filter(s => s.available).length < 3 && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Attention : Peu de créneaux disponibles ce jour
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Réservez vite ou choisissez une autre date pour plus d'options
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                      {timeSlots.map((time) => {
                        const available = isSlotAvailable(time);
                        return (
                          <button
                            key={time}
                            onClick={() => available && setSelectedTime(time)}
                            disabled={!available}
                            className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border-2 font-medium text-sm sm:text-base transition-all duration-300 ${
                              !available 
                                ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed line-through"
                                : selectedTime === time
                                ? "border-[#d4b5a0] bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg"
                                : "border-gray-200 hover:border-[#d4b5a0] text-[#2c3e50] hover:shadow-lg hover:-translate-y-0.5"
                            }`}
                            title={!available ? "Ce créneau est déjà réservé" : "Créneau disponible"}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Légende */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-200 rounded"></div>
                        <span className="text-[#2c3e50]/60">Disponible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
                        <span className="text-[#2c3e50]/60">Indisponible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] rounded"></div>
                        <span className="text-[#2c3e50]/60">Sélectionné</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => {
                      setStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 py-4 border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-xl font-semibold hover:bg-[#d4b5a0] hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <ChevronLeft className="inline w-5 h-5 mr-2" />
                    Retour
                  </button>
                  <button
                    onClick={() => {
                      setStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    Continuer
                    <ChevronRight className="inline w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-3">Vos informations</h2>
                  <p className="text-[#2c3e50]/70">Dernière étape pour confirmer votre rendez-vous</p>
                </div>
                
                {/* Si déjà connecté */}
                {isLoggedIn && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-800 font-medium">Vous êtes connecté(e)</p>
                    </div>
                    <p className="text-sm text-green-700 mt-1">Vos informations sont pré-remplies</p>
                  </div>
                )}
                
                {/* Si pas connecté, choix compte */}
                {!isLoggedIn && (
                  <div className="mb-6 p-6 bg-gradient-to-br from-[#fdfbf7] to-white rounded-xl border border-[#d4b5a0]/20">
                    <h3 className="font-medium text-[#2c3e50] mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-[#d4b5a0]" />
                      Connexion à votre compte
                    </h3>
                    <div className="flex gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setHasAccount(false)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                          !hasAccount 
                            ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white' 
                            : 'bg-white border border-[#d4b5a0]/20 text-[#2c3e50] hover:border-[#d4b5a0]'
                        }`}
                      >
                        Nouveau client
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasAccount(true)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                          hasAccount 
                            ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white' 
                            : 'bg-white border border-[#d4b5a0]/20 text-[#2c3e50] hover:border-[#d4b5a0]'
                        }`}
                      >
                        J'ai déjà un compte
                      </button>
                    </div>
                    
                    {!hasAccount && (
                      <div className="text-center">
                        <p className="text-sm text-[#2c3e50]/60">
                          ✨ Un compte sera créé automatiquement avec votre email
                        </p>
                        <p className="text-xs text-[#2c3e50]/50 mt-1">
                          Vous pourrez suivre vos réservations et accumuler des points fidélité
                        </p>
                      </div>
                    )}
                    
                    {hasAccount && (
                      <p className="text-sm text-[#2c3e50]/60 text-center">
                        Connectez-vous pour retrouver votre historique et vos points de fidélité
                      </p>
                    )}
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center text-lg font-medium text-[#2c3e50] mb-3">
                      <User className="w-5 h-5 mr-2 text-[#d4b5a0]" />
                      Nom complet
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#d4b5a0] focus:outline-none transition-colors text-lg"
                      placeholder="Prénom Nom"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-lg font-medium text-[#2c3e50] mb-3">
                      <Mail className="w-5 h-5 mr-2 text-[#d4b5a0]" />
                      Adresse email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#d4b5a0] focus:outline-none transition-colors text-lg"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-lg font-medium text-[#2c3e50] mb-3">
                      <Phone className="w-5 h-5 mr-2 text-[#d4b5a0]" />
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#d4b5a0] focus:outline-none transition-colors text-lg"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  
                  {/* Mot de passe UNIQUEMENT si déjà client */}
                  {!isLoggedIn && hasAccount && (
                    <div>
                      <label className="flex items-center text-lg font-medium text-[#2c3e50] mb-3">
                        <Lock className="w-5 h-5 mr-2 text-[#d4b5a0]" />
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required={hasAccount}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#d4b5a0] focus:outline-none transition-colors text-lg"
                          placeholder="Votre mot de passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2c3e50]/60 hover:text-[#2c3e50]"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-[#d4b5a0] border-gray-300 rounded focus:ring-[#d4b5a0] focus:ring-offset-0"
                          />
                          <span className="ml-2 text-sm text-[#2c3e50]/70">Se souvenir de moi</span>
                        </label>
                        <Link
                          href="/mot-passe-oublie"
                          className="text-sm text-[#d4b5a0] hover:underline"
                        >
                          Mot de passe oublié ?
                        </Link>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-lg font-medium text-[#2c3e50] mb-3">
                      Notes et demandes spéciales (optionnel)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={4}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#d4b5a0] focus:outline-none transition-colors text-lg resize-none"
                      placeholder="Allergies, préférences, informations complémentaires..."
                    />
                  </div>
                </div>

                {/* Carte Cadeau */}
                <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    Vous avez une carte cadeau ?
                  </h4>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={giftCardCode}
                      onChange={(e) => {
                        setGiftCardCode(e.target.value.toUpperCase());
                        setGiftCardError("");
                        setGiftCardData(null);
                      }}
                      placeholder="GIFT-XXXX-XXXX"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none uppercase"
                      maxLength={14}
                    />
                    <button
                      type="button"
                      onClick={checkGiftCard}
                      disabled={isCheckingGiftCard}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                    >
                      {isCheckingGiftCard ? 'Vérification...' : 'Vérifier'}
                    </button>
                  </div>
                  {giftCardError && (
                    <p className="text-red-500 text-sm mb-2">{giftCardError}</p>
                  )}
                  {giftCardData && (
                    <>
                      {giftCardData.expired && (
                        <div className="mb-3 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                          <p className="text-sm text-orange-700 font-medium">⚠️ {giftCardData.warning}</p>
                        </div>
                      )}
                      <div className="bg-white rounded-lg p-4 mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Solde disponible:</span>
                          <span className="text-lg font-bold text-green-600">{giftCardData.balance}€</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Montant utilisé:</span>
                          <span className="text-lg font-bold text-[#d4b5a0]">{getGiftCardUsedAmount()}€</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Payment Info */}
                <div className="mt-6 p-4 bg-gradient-to-br from-[#fdfbf7] to-white rounded-xl border border-[#d4b5a0]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">💶</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#2c3e50]">Mode de paiement</h4>
                      <p className="text-sm text-[#2c3e50]/70">Paiement en espèces uniquement sur place</p>
                    </div>
                  </div>
                </div>

                {/* Reservation Summary */}
                <div className="mt-8 p-6 bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl border border-[#d4b5a0]/20 shadow-lg">
                  <h3 className="text-xl font-serif font-semibold text-[#2c3e50] mb-4 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-2 text-[#d4b5a0]" />
                    Récapitulatif de votre réservation
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-[#2c3e50]">Soins sélectionnés :</span>
                      <div className="text-right">
                        {selectedServices.map(id => {
                          const service = services.find(s => s.id === id);
                          const isPackage = selectedPackages[id] === "forfait";
                          return (
                            <div key={id} className="text-[#d4b5a0] font-semibold">
                              {service?.name} {service?.icon}
                              {isPackage && (
                                <span className="text-xs ml-1 text-[#c9a084]">(forfait)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#2c3e50]">Date :</span>
                      <span className="text-[#d4b5a0] font-semibold">{new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#2c3e50]">Heure :</span>
                      <span className="text-[#d4b5a0] font-semibold">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#2c3e50]">Durée totale :</span>
                      <span className="text-[#d4b5a0] font-semibold">
                        {selectedServices.reduce((total, id) => {
                          const service = services.find(s => s.id === id);
                          if (!service) return total;
                          const match = service.duration.match(/(\d+)\s*(h|min)/);
                          if (!match) return total;
                          const value = parseInt(match[1]);
                          const unit = match[2];
                          return total + (unit === 'h' ? value * 60 : value);
                        }, 0)} min
                      </span>
                    </div>
                    <hr className="border-[#d4b5a0]/30" />
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold text-[#2c3e50]">Prix total :</span>
                      <span className="text-[#d4b5a0] font-bold text-2xl">{calculateTotal()}€</span>
                    </div>
                    {giftCardData && giftCardData.balance > 0 && (
                      <>
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-medium text-green-600">Carte cadeau :</span>
                          <span className="text-green-600 font-bold">-{getGiftCardUsedAmount()}€</span>
                        </div>
                        <hr className="border-[#d4b5a0]/30" />
                        <div className="flex justify-between items-center text-xl bg-[#d4b5a0]/10 -mx-6 px-6 py-3 rounded-lg">
                          <span className="font-bold text-[#2c3e50]">Montant à payer :</span>
                          <span className="text-[#d4b5a0] font-bold text-2xl">{calculateAmountToPay()}€</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 py-4 border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-xl font-semibold hover:bg-[#d4b5a0] hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <ChevronLeft className="inline w-5 h-5 mr-2" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Confirmation en cours...
                      </>
                    ) : (
                      "Confirmer la réservation"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Informations pratiques */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#d4b5a0]/10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#2c3e50] mb-3">Horaires</h3>
              <div className="space-y-2 text-[#2c3e50]/80">
                <p><strong>Lun - Ven :</strong> 10h00 - 19h00</p>
                <p><strong>Samedi :</strong> 9h00 - 18h00</p>
                <p><strong>Dimanche :</strong> Fermé</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#d4b5a0]/10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-white">💶</span>
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#2c3e50] mb-3">Paiement</h3>
              <p className="text-[#2c3e50]/80 text-sm">
                <strong>Espèces uniquement</strong><br/>
                Le règlement s'effectue sur place après votre soin, en espèces uniquement.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#d4b5a0]/10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#2c3e50] mb-3">Adresse</h3>
              <div className="text-[#2c3e50]/80 text-sm">
                <p>123 Rue de la Beauté</p>
                <p>75008 Paris</p>
                <p className="mt-2">Métro : Champs-Élysées</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Reservation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ReservationContent />
    </Suspense>
  );
}