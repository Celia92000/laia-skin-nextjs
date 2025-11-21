'use client'

import { Gift, Star } from 'lucide-react'

interface LoyaltyCardsProps {
  reservations: any[]
}

export default function LoyaltyCards({ reservations }: LoyaltyCardsProps) {
  const completedCount = reservations.length
  const effectiveCount = completedCount % 6
  const finalCount = effectiveCount === 0 && completedCount > 0 ? 6 : effectiveCount

  const forfaitCount = reservations.filter(r => {
    if (r.status !== 'completed') return false
    try {
      const packages = r.packages ? JSON.parse(typeof r.packages === 'string' ? r.packages : JSON.stringify(r.packages)) : {}
      return Object.values(packages).some(p => p === 'forfait')
    } catch {
      return false
    }
  }).length

  const forfaitEffectiveCount = forfaitCount % 4
  const forfaitFinalCount = forfaitEffectiveCount === 0 && forfaitCount > 0 ? 4 : forfaitEffectiveCount

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Carte fidélité soins */}
      <div className="bg-gradient-to-br from-[#d4b5a0] to-[#b89b88] text-white rounded-2xl p-6 shadow-xl">
        <div className="text-center">
          <Gift className="w-12 h-12 mx-auto mb-3 text-white/80" />
          <h3 className="text-xl font-bold mb-2">Soins Individuels</h3>
          <p className="text-lg mb-4">5 soins = -20€ sur le 6ème</p>

          <div className="bg-white/20 rounded-xl p-4">
            <div className="grid grid-cols-6 gap-2 mb-3">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div
                  key={num}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg font-bold ${
                    num <= finalCount ? 'bg-white text-[#d4b5a0]' : 'bg-white/30 text-white'
                  }`}
                >
                  {num <= finalCount ? '✓' : num}
                </div>
              ))}
            </div>
            <p className="text-sm">
              {effectiveCount === 0 && completedCount > 0 ? '6 soins validés sur 6' : `${effectiveCount} soin${effectiveCount > 1 ? 's' : ''} validé${effectiveCount > 1 ? 's' : ''} sur 6`}
            </p>
            <p className="text-xs mt-1 font-bold">Dès le 1er soin ! -20€ au 6ème soin</p>
          </div>
        </div>
      </div>

      {/* Carte fidélité forfaits */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-xl">
        <div className="text-center">
          <Star className="w-12 h-12 mx-auto mb-3 text-white/80" />
          <h3 className="text-xl font-bold mb-2">Forfaits Premium</h3>
          <p className="text-lg mb-4">3 forfaits = -40€ sur le 4ème</p>

          <div className="bg-white/20 rounded-xl p-4">
            <div className="grid grid-cols-4 gap-3 mb-3">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-xl font-bold ${
                    num <= forfaitFinalCount ? 'bg-white text-purple-600' : 'bg-white/30 text-white'
                  }`}
                >
                  {num <= forfaitFinalCount ? '✓' : num}
                </div>
              ))}
            </div>
            <p className="text-sm">
              {forfaitFinalCount} forfait{forfaitFinalCount > 1 ? 's' : ''} validé{forfaitFinalCount > 1 ? 's' : ''} sur 4
            </p>
            <p className="text-xs mt-1 font-bold">Dès le 1er forfait ! -40€ au 4ème forfait</p>
          </div>
        </div>
      </div>
    </div>
  )
}
