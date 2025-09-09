'use client';

import { useState } from 'react';
import { Gift, CreditCard, Euro, Banknote, Building2 } from 'lucide-react';
import { InvoiceButton } from './InvoiceGenerator';

interface PaymentSectionProps {
  reservation: any;
  loyaltyProfiles: any[];
  recordPayment: (reservationId: string, appliedDiscount?: { type: string, amount: number }, paymentDetails?: any) => void;
}

export default function PaymentSection({ reservation, loyaltyProfiles, recordPayment }: PaymentSectionProps) {
  const [appliedDiscount, setAppliedDiscount] = useState<{ type: string, amount: number } | null>(null);
  const [paymentMode, setPaymentMode] = useState<'simple' | 'mixed'>('simple');
  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  
  // Trouver le profil de fidélité du client
  const userProfile = loyaltyProfiles.find(p => p.user.email === reservation.userEmail);
  const hasIndividualDiscount = userProfile && userProfile.individualServicesCount >= 5 && Math.floor(userProfile.individualServicesCount / 5) > 0;
  const hasPackageDiscount = userProfile && userProfile.packagesCount >= 3 && Math.floor(userProfile.packagesCount / 3) > 0;
  
  const applyLoyaltyDiscount = (type: string, amount: number) => {
    setAppliedDiscount({ type, amount });
    const amountInput = document.getElementById(`amount-${reservation.id}`) as HTMLInputElement;
    if (amountInput) {
      amountInput.value = String(Math.max(0, reservation.totalPrice - amount));
    }
  };

  const cancelDiscount = () => {
    setAppliedDiscount(null);
    const amountInput = document.getElementById(`amount-${reservation.id}`) as HTMLInputElement;
    if (amountInput) {
      amountInput.value = String(reservation.totalPrice);
    }
  };

  return (
    <div className="border-t border-[#d4b5a0]/10 pt-4">
      {/* Affichage des réductions disponibles */}
      {(hasIndividualDiscount || hasPackageDiscount) && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Réductions de fidélité disponibles pour ce client
          </h4>
          <div className="flex gap-2 flex-wrap">
            {hasIndividualDiscount && (
              <button
                onClick={() => applyLoyaltyDiscount('individual', 30)}
                disabled={appliedDiscount?.type === 'individual'}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  appliedDiscount?.type === 'individual'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-green-500 text-green-700 hover:bg-green-50'
                }`}
              >
                {appliedDiscount?.type === 'individual' && '✓ '}
                -30€ (5 soins effectués)
              </button>
            )}
            {hasPackageDiscount && (
              <button
                onClick={() => applyLoyaltyDiscount('package', 50)}
                disabled={appliedDiscount?.type === 'package'}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  appliedDiscount?.type === 'package'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-purple-500 text-purple-700 hover:bg-purple-50'
                }`}
              >
                {appliedDiscount?.type === 'package' && '✓ '}
                -50€ (3 forfaits effectués)
              </button>
            )}
            {appliedDiscount && (
              <button
                onClick={cancelDiscount}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
              >
                ✕ Annuler la réduction
              </button>
            )}
          </div>
          {appliedDiscount && (
            <div className="mt-3 p-3 bg-white rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prix original :</span>
                <span className="text-sm line-through text-gray-500">{reservation.totalPrice}€</span>
              </div>
              <div className="flex justify-between items-center text-green-700 font-semibold">
                <span className="text-sm">Réduction appliquée :</span>
                <span>-{appliedDiscount.amount}€</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-[#2c3e50] pt-2 border-t mt-2">
                <span>Nouveau total :</span>
                <span className="text-[#d4b5a0]">{Math.max(0, reservation.totalPrice - appliedDiscount.amount)}€</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      <h4 className="font-medium text-[#2c3e50] mb-3">Enregistrer le paiement</h4>
      
      {/* Sélection du mode de paiement */}
      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPaymentMode('simple')}
            className={`px-4 py-2 rounded-lg transition-all ${
              paymentMode === 'simple'
                ? 'bg-[#d4b5a0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Paiement simple
          </button>
          <button
            onClick={() => setPaymentMode('mixed')}
            className={`px-4 py-2 rounded-lg transition-all ${
              paymentMode === 'mixed'
                ? 'bg-[#d4b5a0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Paiement mixte
          </button>
        </div>

        {paymentMode === 'simple' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-[#2c3e50]/60 mb-1 block">Montant payé</label>
              <input
                type="number"
                placeholder="Montant payé"
                defaultValue={appliedDiscount ? Math.max(0, reservation.totalPrice - appliedDiscount.amount) : reservation.totalPrice}
                id={`amount-${reservation.id}`}
                className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-[#2c3e50]/60 mb-1 block">Mode de paiement</label>
              <select
                id={`method-${reservation.id}`}
                className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              >
                <option value="cash">Espèces</option>
                <option value="card">Carte bancaire</option>
                <option value="transfer">Virement</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-[#2c3e50]/60 mb-1 block">N° Facture</label>
              <input
                type="text"
                placeholder="ex: 2024-001"
                id={`invoice-${reservation.id}`}
                className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-[#2c3e50] mb-3">
                Total à payer : {appliedDiscount ? Math.max(0, reservation.totalPrice - appliedDiscount.amount) : reservation.totalPrice}€
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-green-600" />
                  <label className="text-sm text-[#2c3e50]/60">Espèces</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 px-2 py-1 border border-[#d4b5a0]/20 rounded focus:border-[#d4b5a0] focus:outline-none"
                  />
                  <span className="text-sm">€</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <label className="text-sm text-[#2c3e50]/60">Carte</label>
                  <input
                    type="number"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 px-2 py-1 border border-[#d4b5a0]/20 rounded focus:border-[#d4b5a0] focus:outline-none"
                  />
                  <span className="text-sm">€</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <label className="text-sm text-[#2c3e50]/60">Virement</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 px-2 py-1 border border-[#d4b5a0]/20 rounded focus:border-[#d4b5a0] focus:outline-none"
                  />
                  <span className="text-sm">€</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total payé :</span>
                  <span className={`font-bold ${
                    cashAmount + cardAmount + transferAmount === (appliedDiscount ? Math.max(0, reservation.totalPrice - appliedDiscount.amount) : reservation.totalPrice)
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {cashAmount + cardAmount + transferAmount}€
                  </span>
                </div>
                {cashAmount + cardAmount + transferAmount !== (appliedDiscount ? Math.max(0, reservation.totalPrice - appliedDiscount.amount) : reservation.totalPrice) && (
                  <p className="text-xs text-orange-600 mt-1">
                    Reste : {(appliedDiscount ? Math.max(0, reservation.totalPrice - appliedDiscount.amount) : reservation.totalPrice) - (cashAmount + cardAmount + transferAmount)}€
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="N° Facture (ex: 2024-001)"
                id={`invoice-${reservation.id}`}
                className="px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Notes (optionnel)"
                id={`notes-${reservation.id}`}
                className="px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            const paymentDetails = paymentMode === 'mixed' 
              ? { 
                  cash: cashAmount, 
                  card: cardAmount, 
                  transfer: transferAmount,
                  total: cashAmount + cardAmount + transferAmount
                }
              : null;
            recordPayment(reservation.id, appliedDiscount || undefined, paymentDetails);
          }}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Valider le paiement
        </button>
        <InvoiceButton reservation={{
          ...reservation,
          client: reservation.userName || 'Client',
          email: reservation.userEmail
        }} />
      </div>
    </div>
  );
}