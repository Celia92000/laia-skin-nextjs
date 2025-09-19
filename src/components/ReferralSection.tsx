'use client';

import { useState, useEffect } from 'react';
import { Gift, Users, Share2, Copy, Check, Euro, Send, UserPlus, Clock, CheckCircle } from 'lucide-react';

interface Referral {
  id: string;
  name: string;
  email: string;
  status: string;
  rewardAmount: number;
  createdAt: string;
  firstServiceDate?: string;
  canUseReward: boolean;
}

export default function ReferralSection() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [availableRewards, setAvailableRewards] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/referral', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReferralCode(data.referralCode || '');
        setReferrals(data.referrals || []);
        setAvailableRewards(data.availableRewardsAmount || 0);
        setShareUrl(data.shareUrl || '');
      }
    } catch (error) {
      console.error('Erreur récupération parrainage:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvitation = async () => {
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName
        })
      });

      if (response.ok) {
        // Rafraîchir les données
        fetchReferralData();
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteName('');
        alert('Invitation envoyée avec succès !');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur envoi invitation:', error);
      alert('Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      case 'used':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <UserPlus className="w-3 h-3" />
            Inscrit
          </span>
        );
      case 'rewarded':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Récompensé
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec stats */}
      <div className="bg-gradient-to-r from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#d4b5a0] rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2c3e50]">Programme de Parrainage</h3>
              <p className="text-sm text-[#2c3e50]/70">Gagnez 20€ pour chaque ami parrainé !</p>
            </div>
          </div>
          
          {availableRewards > 0 && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
              <p className="text-2xl font-bold">{availableRewards}€</p>
              <p className="text-xs">disponibles</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/80 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#2c3e50]">{referrals.length}</p>
            <p className="text-sm text-[#2c3e50]/60">Amis parrainés</p>
          </div>
          
          <div className="bg-white/80 rounded-lg p-4 text-center">
            <Euro className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#2c3e50]">20€</p>
            <p className="text-sm text-[#2c3e50]/60">Par parrainage</p>
          </div>
          
          <div className="bg-white/80 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#2c3e50]">
              {referrals.filter(r => r.status === 'rewarded').length}
            </p>
            <p className="text-sm text-[#2c3e50]/60">Récompenses gagnées</p>
          </div>
        </div>
      </div>

      {/* Code de parrainage */}
      {referralCode && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-[#2c3e50] mb-4">Votre code de parrainage</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg p-4 font-mono text-lg text-center">
              {referralCode}
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-4 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <Share2 className="w-4 h-4 inline mr-2" />
              Partagez ce lien avec vos amis : 
              <span className="font-medium ml-1">{shareUrl}</span>
            </p>
          </div>
        </div>
      )}

      {/* Bouton inviter */}
      <button
        onClick={() => setShowInviteModal(true)}
        className="w-full px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        Inviter un ami par email
      </button>

      {/* Liste des parrainages */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-semibold text-[#2c3e50]">Vos parrainages</h4>
          </div>
          
          <div className="divide-y divide-gray-100">
            {referrals.map(referral => (
              <div key={referral.id} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-[#2c3e50]">{referral.name}</p>
                  <p className="text-sm text-[#2c3e50]/60">{referral.email}</p>
                  <p className="text-xs text-[#2c3e50]/40 mt-1">
                    Invité le {new Date(referral.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(referral.status)}
                  
                  {referral.canUseReward && (
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold">
                      20€ disponibles
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment ça marche */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h4 className="font-semibold text-[#2c3e50] mb-4">Comment ça marche ?</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-700">1</span>
            </div>
            <p className="text-sm text-[#2c3e50]">
              Partagez votre code ou envoyez une invitation à vos amis
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-700">2</span>
            </div>
            <p className="text-sm text-[#2c3e50]">
              Votre ami s'inscrit et réserve son premier soin
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-700">3</span>
            </div>
            <p className="text-sm text-[#2c3e50]">
              Après son premier soin, vous recevez 20€ de réduction !
            </p>
          </div>
        </div>
      </div>

      {/* Modal invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">
              Inviter un ami
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Nom de votre ami
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="Marie Dupont"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="marie@email.com"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={sendInvitation}
                  disabled={!inviteEmail || !inviteName || sending}
                  className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}