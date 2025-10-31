"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GiftCardPurchaseForm from "@/components/gift-cards/GiftCardPurchaseForm";
import {
  Gift, Search, Calendar, Sparkles, Heart, Star, MapPin, Phone, Mail
} from "lucide-react";

export default function CarteCadeau() {
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardData, setGiftCardData] = useState<any>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  const checkGiftCardCode = async () => {
    if (!giftCardCode.trim()) {
      setCodeError("Veuillez entrer un code");
      return;
    }

    setIsCheckingCode(true);
    setCodeError("");
    setGiftCardData(null);

    try {
      const response = await fetch(`/api/gift-cards?code=${encodeURIComponent(giftCardCode.toUpperCase())}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setGiftCardData(data);
      } else {
        setCodeError(data.error || "Code invalide");
      }
    } catch (error) {
      setCodeError("Erreur lors de la vérification du code");
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleUseGiftCard = () => {
    // Redirection vers /reservation avec le code pré-rempli
    window.location.href = `/reservation?giftCard=${giftCardCode.toUpperCase()}`;
  };

  return (
    <>
      <Header />
      <main className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-white to-secondary">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-primary mb-4">
              Cartes Cadeaux
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Offrez ou utilisez une carte cadeau pour profiter de nos soins.
            </p>
          </div>

          {/* Formulaire d'achat en ligne */}
          <GiftCardPurchaseForm />

          {/* Vérifier le solde */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Search className="mr-3 text-primary" />
              Vérifier mon solde
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Entrez votre code carte cadeau
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={giftCardCode}
                  onChange={(e) => {
                    setGiftCardCode(e.target.value.toUpperCase());
                    setCodeError("");
                    setGiftCardData(null);
                  }}
                  placeholder="GIFT-XXXX-XXXX"
                  className="flex-1 p-4 border border-gray-300 rounded-lg focus:border-primary focus:outline-none uppercase"
                  maxLength={14}
                />
                <button
                  onClick={checkGiftCardCode}
                  disabled={isCheckingCode}
                  className="px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-300"
                >
                  {isCheckingCode ? 'Vérification...' : 'Vérifier'}
                </button>
              </div>
              {codeError && (
                <p className="text-red-500 text-sm mt-2">{codeError}</p>
              )}
            </div>

            {giftCardData && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setGiftCardData(null)}
                />

                {/* Modal */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                  <div
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Bouton fermer */}
                    <button
                      onClick={() => setGiftCardData(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="p-6">

                      <div className="bg-gradient-to-br from-primary/10 to-secondary/20 rounded-xl p-6">
                        {giftCardData.expired && (
                          <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                            <p className="text-sm text-orange-700 font-medium">⚠️ {giftCardData.warning}</p>
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-primary mb-2">
                              {giftCardData.code}
                            </h3>
                            <p className="text-sm text-muted">
                              Valide jusqu'au {new Date(giftCardData.giftCard?.expiryDate || giftCardData.expiryDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted">Solde disponible</p>
                            <p className="text-3xl font-bold text-primary">
                              {giftCardData.balance}€
                            </p>
                          </div>
                        </div>

                        {giftCardData.balance !== giftCardData.initialAmount && (
                          <div className="mb-4 p-3 bg-white/50 rounded-lg">
                            <p className="text-sm text-muted">
                              Montant initial: <strong>{giftCardData.initialAmount}€</strong>
                            </p>
                            <p className="text-sm text-muted">
                              Montant utilisé: <strong>{giftCardData.initialAmount - giftCardData.balance}€</strong>
                            </p>
                          </div>
                        )}

                        {giftCardData.reservations && giftCardData.reservations.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 text-sm">Historique d'utilisation:</h4>
                            <div className="space-y-2">
                              {giftCardData.reservations.map((res: any) => (
                                <div key={res.id} className="bg-white/50 rounded-lg p-3 text-sm">
                                  <div className="flex justify-between">
                                    <span>{new Date(res.date).toLocaleDateString('fr-FR')} - {res.time}</span>
                                    <span className="font-semibold text-primary">-{res.giftCardUsedAmount}€</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {giftCardData.balance > 0 && (
                          <button
                            onClick={handleUseGiftCard}
                            className="w-full py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center justify-center"
                          >
                            <Calendar className="mr-2" size={20} />
                            Réserver un soin avec cette carte
                          </button>
                        )}

                        {giftCardData.balance === 0 && (
                          <div className="text-center p-4 bg-gray-100 rounded-lg">
                            <p className="text-muted">Cette carte a été entièrement utilisée</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Avantages */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Cadeau parfait</h3>
              <p className="text-sm text-muted">
                Offrez un moment de détente et de beauté à vos proches
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Utilisable partout</h3>
              <p className="text-sm text-muted">
                Valable sur tous nos soins et produits
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Flexibilité totale</h3>
              <p className="text-sm text-muted">
                Utilisable en une ou plusieurs fois pendant 1 an
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
