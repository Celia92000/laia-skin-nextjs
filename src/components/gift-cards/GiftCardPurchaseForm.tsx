'use client'

import { useState } from 'react'
import { Gift, User, Mail, MessageSquare, CheckCircle, Loader2, Phone } from 'lucide-react'

export default function GiftCardPurchaseForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [createdGiftCard, setCreatedGiftCard] = useState<any>(null)

  const [formData, setFormData] = useState({
    amount: 50,
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    recipientName: '',
    recipientEmail: '',
    message: ''
  })

  const predefinedAmounts = [30, 50, 75, 100, 150, 200]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (formData.amount < 20 || formData.amount > 500) {
        setError('Le montant doit être entre 20€ et 500€')
        setLoading(false)
        return
      }

      if (!formData.senderName || !formData.senderEmail || !formData.senderPhone || !formData.recipientName || !formData.recipientEmail) {
        setError('Veuillez remplir tous les champs obligatoires')
        setLoading(false)
        return
      }

      // Appeler l'API d'achat (paiement sur place)
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la carte cadeau')
      }

      // Afficher le message de succès
      setSuccess(true)
      setCreatedGiftCard(data.giftCard)

      // Réinitialiser le formulaire
      setFormData({
        amount: 50,
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        recipientName: '',
        recipientEmail: '',
        message: ''
      })
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Afficher le message de succès
  if (success && createdGiftCard) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Demande enregistrée !</h2>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-700">
            Votre demande de carte cadeau a bien été enregistrée.
          </p>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes :</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Rendez-vous à l'institut pour effectuer le paiement de <strong>{createdGiftCard.amount}€</strong></li>
              <li>Une fois le paiement validé, vous recevrez votre carte cadeau par email</li>
              <li>Code de référence : <strong className="text-blue-900">{createdGiftCard.code}</strong></li>
            </ol>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Important :</strong> La carte cadeau ne sera activée qu'après votre paiement sur place à l'institut.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSuccess(false)
            setCreatedGiftCard(null)
          }}
          className="w-full py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Commander une autre carte cadeau
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#d4b5a0]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-xl">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Commander une carte cadeau</h2>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Paiement sur place :</strong> Remplissez le formulaire ci-dessous. Vous pourrez payer directement à l'institut et recevoir votre carte cadeau par email.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant de la carte cadeau *
          </label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {predefinedAmounts.map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => setFormData({ ...formData, amount })}
                className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                  formData.amount === amount
                    ? 'border-[#d4b5a0] bg-[#d4b5a0]/10 text-[#d4b5a0]'
                    : 'border-gray-200 hover:border-[#d4b5a0]/50'
                }`}
              >
                {amount}€
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="number"
              min="10"
              max="500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
              placeholder="Ou entrez un montant personnalisé"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Entre 10€ et 500€</p>
        </div>

        {/* Informations acheteur */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#d4b5a0]" />
            Vos informations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre nom *
              </label>
              <input
                type="text"
                required
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre email *
              </label>
              <input
                type="email"
                required
                value={formData.senderEmail}
                onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                placeholder="jean.dupont@email.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre téléphone *
              </label>
              <input
                type="tel"
                required
                value={formData.senderPhone}
                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                placeholder="+33 6 00 00 00 00"
              />
            </div>
          </div>
        </div>

        {/* Informations bénéficiaire (optionnel) */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#d4b5a0]" />
            Pour qui est cette carte ? *
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Informations du bénéficiaire de la carte cadeau
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du bénéficiaire *
              </label>
              <input
                type="text"
                required
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                placeholder="Marie Martin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du bénéficiaire *
              </label>
              <input
                type="email"
                required
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#d4b5a0] focus:outline-none"
                placeholder="marie.martin@email.com"
              />
            </div>
          </div>
        </div>

        {/* Message personnalisé */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#d4b5a0]" />
            Message personnalisé (optionnel)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#d4b5a0] focus:outline-none resize-none"
            placeholder="Écrivez un message personnalisé qui apparaîtra sur la carte cadeau..."
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formData.message.length}/500 caractères
          </p>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enregistrement en cours...
            </>
          ) : (
            <>
              <Gift className="w-5 h-5" />
              Enregistrer ma demande
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Paiement sur place à l'institut
        </div>
      </form>
    </div>
  )
}
