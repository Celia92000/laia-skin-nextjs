"use client";

import { useState, useEffect } from 'react';
import { FaInstagram, FaFacebook, FaTiktok, FaImage, FaVideo, FaClock, FaCalendarAlt, FaHashtag, FaCheckCircle } from 'react-icons/fa';
import CanvaIntegration from './CanvaIntegration';

interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledDate: string;
  status: string;
  mediaUrls?: string[];
  hashtags?: string;
  instagramType?: string;
  facebookType?: string;
  category?: string;
}

export default function SimpleSocialMediaPlanner() {
  const [step, setStep] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [publishMode, setPublishMode] = useState<'draft' | 'schedule' | 'publish'>('draft');

  // Déterminer les types de contenu compatibles avec toutes les plateformes sélectionnées
  const getAvailableContentTypes = () => {
    if (selectedPlatforms.length === 0) return [];

    // Types de contenu par plateforme
    const platformTypes: Record<string, string[]> = {
      instagram: ['post', 'story', 'reel'],
      facebook: ['post', 'story', 'reel'],
      tiktok: ['reel'],
      linkedin: ['post'],
      snapchat: ['story'],
      twitter: ['post']
    };

    // Intersection : types compatibles avec TOUTES les plateformes sélectionnées
    let availableTypes = platformTypes[selectedPlatforms[0]] || [];

    for (const platform of selectedPlatforms.slice(1)) {
      const types = platformTypes[platform] || [];
      availableTypes = availableTypes.filter(type => types.includes(type));
    }

    return availableTypes;
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.filter((p: Post) => p.status === 'scheduled'));
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map(file => URL.createObjectURL(file));
    setMediaPreview(previews);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const createPost = async (mode: 'draft' | 'schedule' | 'publish') => {
    try {
      const token = localStorage.getItem('token');

      // Validation
      if (selectedPlatforms.length === 0) {
        alert('❌ Veuillez sélectionner au moins une plateforme');
        return;
      }

      // Pour les stories et reels, le média est obligatoire
      if ((contentType === 'story' || contentType === 'reel') && mediaPreview.length === 0) {
        alert(`❌ Un média est obligatoire pour ${contentType === 'story' ? 'une story' : 'un reel'}`);
        return;
      }

      // Pour les posts classiques, le contenu textuel est obligatoire
      if (contentType === 'post' && !content.trim()) {
        alert('❌ Veuillez rédiger un message');
        return;
      }

      // Valider la date uniquement pour les modes schedule et publish
      if ((mode === 'schedule' || mode === 'publish') && (!scheduledDate || !scheduledTime)) {
        alert('❌ Veuillez sélectionner une date et une heure');
        return;
      }

      let scheduledDateTime = null;
      if (mode === 'schedule') {
        const dateTimeString = `${scheduledDate}T${scheduledTime}`;
        const postDate = new Date(dateTimeString);

        if (isNaN(postDate.getTime())) {
          alert('❌ Date ou heure invalide');
          return;
        }
        scheduledDateTime = postDate.toISOString();
      } else if (mode === 'publish') {
        scheduledDateTime = new Date().toISOString();
      }

      const postData = {
        title: contentType === 'story' ? `Story ${new Date().toLocaleString('fr-FR')}` :
               contentType === 'reel' ? `Reel ${content.substring(0, 30) || 'Sans titre'}` :
               content.substring(0, 50),
        content: content || (contentType === 'story' ? '' : ''),
        platforms: selectedPlatforms,
        scheduledDate: scheduledDateTime,
        status: mode === 'draft' ? 'draft' : mode === 'schedule' ? 'scheduled' : 'publishing',
        publishNow: mode === 'publish',
        hashtags: contentType === 'story' ? '' : hashtags,
        mediaUrls: mediaPreview,
        instagramType: selectedPlatforms.includes('instagram') ? contentType : undefined,
        facebookType: selectedPlatforms.includes('facebook') ? contentType : undefined,
        tiktokType: selectedPlatforms.includes('tiktok') ? 'reel' : undefined,
        category
      };

      const response = await fetch('/api/admin/social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const successMsg = mode === 'draft' ? '✅ Brouillon sauvegardé !' :
                          mode === 'schedule' ? '✅ Post planifié avec succès !' :
                          '✅ Publication en cours sur les réseaux sociaux...';
        alert(successMsg);
        resetForm();
        loadPosts();
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error || 'Erreur lors de la publication'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la publication');
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedPlatforms([]);
    setContentType('');
    setCategory('');
    setContent('');
    setHashtags('');
    setScheduledDate('');
    setScheduledTime('14:00');
    setMediaPreview([]);
    setPublishMode('schedule');
  };

  const suggestedHashtags = {
    conseils: '#skincare #beautytips #skincaretips #beautyroutine',
    'avant-apres': '#transformation #beforeafter #results #skincareroutine',
    nouveaute: '#new #nouveaute #lancement #exclusive',
    promotion: '#promo #offre #bonplan #deal',
    temoignage: '#avis #testimonial #clientsatisfait #reviews',
    coulisses: '#behindthescenes #coulisses #institut #team',
    education: '#skincareeducation #beautytips #skinhealth #dermatology',
    inspiration: '#inspiration #motivation #selfcare #wellness'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with glassmorphism */}
        <div className="text-center mb-8 backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
            ✨ Créer une publication
          </h1>
          <p className="text-white/80 text-lg">Simple et rapide en 5 étapes</p>
        </div>

        {/* Modern Progress Bar with glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                  step >= s
                    ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white scale-110 shadow-2xl shadow-purple-500/50 rotate-3'
                    : 'bg-white/20 text-white/40 backdrop-blur-sm'
                }`}>
                  {step > s ? <FaCheckCircle className="animate-bounce-once" /> : s}
                  {step === s && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse opacity-50"></div>
                  )}
                </div>
                {s < 5 && (
                  <div className="flex-1 mx-3 relative">
                    <div className="h-2 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 transition-all duration-700 ${
                        step > s ? 'w-full' : 'w-0'
                      }`}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-white font-medium text-lg">
            {step === 1 && '📱 Choisissez votre plateforme'}
            {step === 2 && '📸 Type de contenu'}
            {step === 3 && '🏷️ Catégorie'}
            {step === 4 && '✍️ Rédigez votre message'}
            {step === 5 && '📅 Planification'}
          </div>
        </div>

        {/* Step 1: Platform - Multi-select */}
        {step === 1 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-10 animate-slideUp border border-white/20">
            <h2 className="text-3xl font-black mb-4 text-center text-white drop-shadow-lg">
              📱 Choisissez vos plateformes
            </h2>
            <p className="text-white/70 text-center mb-8">Sélectionnez une ou plusieurs plateformes</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { id: 'instagram', icon: FaInstagram, name: 'Instagram', desc: 'Stories, Posts, Reels', color: 'purple-pink', badge: 'Populaire' },
                { id: 'facebook', icon: FaFacebook, name: 'Facebook', desc: 'Publications, Stories', color: 'blue-cyan' },
                { id: 'tiktok', icon: FaTiktok, name: 'TikTok', desc: 'Vidéos courtes', color: 'gray-black' },
                { id: 'linkedin', icon: FaInstagram, name: 'LinkedIn', desc: 'Posts professionnels', color: 'blue-indigo' },
                { id: 'snapchat', icon: FaTiktok, name: 'Snapchat', desc: 'Stories & Snaps', color: 'yellow-amber' }
              ].map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`group relative p-8 rounded-3xl border-2 backdrop-blur-lg shadow-xl transition-all duration-500 transform hover:scale-105 ${
                      isSelected
                        ? 'border-green-400 bg-green-500/30 scale-105 shadow-green-500/50'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                        <FaCheckCircle className="w-5 h-5" />
                      </div>
                    )}
                    {platform.badge && (
                      <div className="absolute -top-3 -left-3 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                        {platform.badge}
                      </div>
                    )}
                    <Icon className="w-16 h-16 mx-auto mb-3 text-white drop-shadow-2xl" />
                    <h3 className="text-xl font-black text-white drop-shadow-lg">{platform.name}</h3>
                    <p className="text-xs text-white/70 mt-1 font-medium">{platform.desc}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                const availableTypes = getAvailableContentTypes();

                if (availableTypes.length === 0) {
                  alert('❌ Les plateformes sélectionnées n\'ont aucun type de contenu compatible en commun');
                  return;
                }

                // Si un seul type de contenu disponible, le définir et passer directement à l'étape 3
                if (availableTypes.length === 1) {
                  setContentType(availableTypes[0]);
                  setStep(3);
                } else {
                  // Plusieurs types disponibles, aller à l'étape 2 pour choisir
                  setStep(2);
                }
              }}
              disabled={selectedPlatforms.length === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform ${
                selectedPlatforms.length > 0
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl hover:scale-105'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              Continuer ({selectedPlatforms.length} plateforme{selectedPlatforms.length > 1 ? 's' : ''})
            </button>
          </div>
        )}

        {/* Step 2: Content Type - Dynamique selon plateformes sélectionnées */}
        {step === 2 && (() => {
          const availableTypes = getAvailableContentTypes();

          if (availableTypes.length === 0) {
            // Aucun type compatible, retour à l'étape 1
            setStep(1);
            return null;
          }

          if (availableTypes.length === 1) {
            // Un seul type compatible, passer directement à l'étape 3
            setContentType(availableTypes[0]);
            setStep(3);
            return null;
          }

          return (
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-10 animate-slideUp border border-white/20">
              <h2 className="text-3xl font-black mb-8 text-center text-white drop-shadow-lg">
                📸 Quel type de contenu ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availableTypes.includes('post') && (
                  <button
                    onClick={() => { setContentType('post'); setStep(3); }}
                    className="group relative p-8 rounded-3xl border-2 border-white/30 hover:border-purple-400 backdrop-blur-lg bg-white/5 hover:bg-white/20 shadow-xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-110"
                  >
                    <FaImage className="w-16 h-16 mx-auto mb-4 text-white drop-shadow-2xl group-hover:scale-125 transition-transform duration-500" />
                    <h3 className="font-black text-white text-xl">Publication</h3>
                    <p className="text-sm text-white/60 mt-2">Photo ou carousel</p>
                  </button>
                )}

                {availableTypes.includes('story') && (
                  <button
                    onClick={() => { setContentType('story'); setStep(3); }}
                    className="group relative p-8 rounded-3xl border-2 border-white/30 hover:border-pink-400 backdrop-blur-lg bg-white/5 hover:bg-white/20 shadow-xl hover:shadow-pink-500/50 transition-all duration-500 transform hover:scale-110"
                  >
                    <FaCalendarAlt className="w-16 h-16 mx-auto mb-4 text-white drop-shadow-2xl group-hover:scale-125 transition-transform duration-500" />
                    <h3 className="font-black text-white text-xl">Story</h3>
                    <p className="text-sm text-white/60 mt-2">24h • Format 9:16</p>
                  </button>
                )}

                {availableTypes.includes('reel') && (
                  <button
                    onClick={() => { setContentType('reel'); setStep(3); }}
                    className="group relative p-8 rounded-3xl border-2 border-white/30 hover:border-rose-400 backdrop-blur-lg bg-white/5 hover:bg-white/20 shadow-xl hover:shadow-rose-500/50 transition-all duration-500 transform hover:scale-110"
                  >
                    <FaVideo className="w-16 h-16 mx-auto mb-4 text-white drop-shadow-2xl group-hover:scale-125 transition-transform duration-500" />
                    <h3 className="font-black text-white text-xl">Reel</h3>
                    <p className="text-sm text-white/60 mt-2">Format vertical</p>
                  </button>
                )}
              </div>

              <button
                onClick={() => setStep(1)}
                className="mt-8 w-full py-4 backdrop-blur-lg bg-white/10 border-2 border-white/30 rounded-2xl hover:bg-white/20 transition-all text-white font-bold hover:scale-105 transform duration-300"
              >
                ← Retour
              </button>
            </div>
          );
        })()}

        {/* Step 3: Category */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-center">🏷️ Quelle catégorie ?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'conseils', emoji: '💡', name: 'Conseils' },
                { id: 'avant-apres', emoji: '✨', name: 'Avant/Après' },
                { id: 'nouveaute', emoji: '🆕', name: 'Nouveauté' },
                { id: 'promotion', emoji: '🎁', name: 'Promo' },
                { id: 'temoignage', emoji: '💬', name: 'Témoignage' },
                { id: 'coulisses', emoji: '🎬', name: 'Coulisses' },
                { id: 'education', emoji: '📚', name: 'Éducatif' },
                { id: 'inspiration', emoji: '🌟', name: 'Inspiration' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setHashtags(suggestedHashtags[cat.id as keyof typeof suggestedHashtags]);
                    setStep(4);
                  }}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <div className="text-sm font-medium">{cat.name}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const needsContentType = selectedPlatforms.includes('instagram') || selectedPlatforms.includes('facebook');
                setStep(needsContentType ? 2 : 1);
              }}
              className="mt-6 w-full py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              ← Retour
            </button>
          </div>
        )}

        {/* Step 4: Content - Adapté selon le type */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {contentType === 'story' && '📸 Créez votre Story'}
              {contentType === 'reel' && '🎬 Créez votre Reel'}
              {contentType === 'post' && '✍️ Rédigez votre publication'}
            </h2>

            {/* Alerte format selon type */}
            {contentType === 'story' && (
              <div className="mb-6 p-4 bg-pink-50 border-2 border-pink-200 rounded-xl">
                <p className="text-sm font-medium text-pink-800">
                  ⚠️ <strong>Story</strong> : Format vertical 9:16 (1080x1920px) • Visible 24h • Média OBLIGATOIRE
                </p>
              </div>
            )}
            {contentType === 'reel' && (
              <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <p className="text-sm font-medium text-purple-800">
                  ⚠️ <strong>Reel/Vidéo</strong> : Format vertical 9:16 • Vidéo de 15s à 90s • Vidéo OBLIGATOIRE
                </p>
              </div>
            )}

            {/* Canva Integration */}
            <div className="mb-6">
              <CanvaIntegration
                platform={selectedPlatforms[0]}
                contentType={contentType}
              />
            </div>

            {/* Upload Media - PRIORITAIRE pour story/reel */}
            <div className="mb-6">
              <label className={`block w-full p-12 border-3 border-dashed rounded-2xl transition-all cursor-pointer ${
                contentType === 'story' || contentType === 'reel'
                  ? 'border-pink-400 bg-pink-50 hover:bg-pink-100'
                  : 'border-purple-300 bg-purple-50 hover:bg-purple-100'
              }`}>
                <input
                  type="file"
                  multiple={contentType === 'post'}
                  accept={contentType === 'reel' ? 'video/*' : contentType === 'story' ? 'image/*,video/*' : 'image/*,video/*'}
                  onChange={handleMediaUpload}
                  className="hidden"
                  required={contentType === 'story' || contentType === 'reel'}
                />
                <div className="text-center">
                  {contentType === 'reel' ? (
                    <FaVideo className="w-16 h-16 mx-auto text-pink-500 mb-4" />
                  ) : contentType === 'story' ? (
                    <FaImage className="w-16 h-16 mx-auto text-pink-500 mb-4" />
                  ) : (
                    <FaImage className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                  )}
                  <p className="text-lg font-medium text-gray-700">
                    {contentType === 'reel' ? '🎥 Ajoutez votre vidéo (OBLIGATOIRE)' :
                     contentType === 'story' ? '📸 Ajoutez une photo ou vidéo (OBLIGATOIRE)' :
                     'Ajoutez vos photos (optionnel)'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {contentType === 'reel' ? 'MP4, MOV • 15s-90s • Format 9:16' :
                     contentType === 'story' ? 'JPG, PNG, MP4 • Format 9:16' :
                     'JPG, PNG, MP4 • Max 10 fichiers'}
                  </p>
                </div>
              </label>

              {mediaPreview.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {mediaPreview.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>

            {/* Text - Adapté selon type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {contentType === 'story' ? '📝 Texte (optionnel)' :
                 contentType === 'reel' ? '✏️ Légende' :
                 '✍️ Message'}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  contentType === 'story' ? 'Texte court pour votre story... (optionnel)' :
                  contentType === 'reel' ? 'Écrivez la légende de votre reel... 🎬' :
                  'Écrivez votre message... 💭'
                }
                className={`w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none ${
                  contentType === 'story' ? 'h-20' : 'h-32'
                }`}
              />
              {contentType === 'story' && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Pour les stories, le texte est souvent ajouté directement sur l'image
                </p>
              )}
            </div>

            {/* Hashtags - Masqué pour les stories */}
            {contentType !== 'story' && (
              <div className="relative mb-4">
                <FaHashtag className="absolute left-4 top-4 text-gray-400" />
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="Hashtags suggérés..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={() => {
                  // Validation selon type
                  if ((contentType === 'story' || contentType === 'reel') && mediaPreview.length === 0) {
                    alert(`❌ Un média est obligatoire pour ${contentType === 'story' ? 'une story' : 'un reel'} !`);
                    return;
                  }
                  setStep(5);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Schedule */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-center">📅 Publication</h2>

            {/* Publication Mode Selection - Déplacé en premier */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
              <p className="text-sm font-bold text-purple-900 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-purple-600" />
                Mode de publication
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setPublishMode('draft')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    publishMode === 'draft'
                      ? 'border-purple-500 bg-purple-500 text-white shadow-lg'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="font-bold">📝 Brouillon</div>
                  <div className="text-xs mt-1 opacity-80">Sauvegarder sans publier</div>
                </button>
                <button
                  onClick={() => setPublishMode('schedule')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    publishMode === 'schedule'
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="font-bold">⏰ Planifier</div>
                  <div className="text-xs mt-1 opacity-80">Programmer pour plus tard</div>
                </button>
                <button
                  onClick={() => setPublishMode('publish')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    publishMode === 'publish'
                      ? 'border-green-500 bg-green-500 text-white shadow-lg'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="font-bold">🚀 Publier</div>
                  <div className="text-xs mt-1 opacity-80">Publier maintenant</div>
                </button>
              </div>
            </div>

            {/* Date/Time Selection - Masqué en mode brouillon */}
            {publishMode !== 'draft' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <FaCalendarAlt className="text-purple-500" />
                      Date {publishMode === 'schedule' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required={publishMode === 'schedule'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <FaClock className="text-purple-500" />
                      Heure {publishMode === 'schedule' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      required={publishMode === 'schedule'}
                    />
                  </div>
                </div>

                {/* Best times suggestion - Seulement en mode planification */}
                {publishMode === 'schedule' && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-medium text-purple-700 mb-2">💡 Meilleurs horaires :</p>
                    <div className="flex gap-2">
                      <button onClick={() => setScheduledTime('09:00')} className="px-3 py-1 bg-white rounded-lg text-xs hover:bg-purple-100">9h</button>
                      <button onClick={() => setScheduledTime('12:00')} className="px-3 py-1 bg-white rounded-lg text-xs hover:bg-purple-100">12h</button>
                      <button onClick={() => setScheduledTime('18:00')} className="px-3 py-1 bg-white rounded-lg text-xs hover:bg-purple-100">18h</button>
                      <button onClick={() => setScheduledTime('20:00')} className="px-3 py-1 bg-white rounded-lg text-xs hover:bg-purple-100">20h</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Info brouillon */}
            {publishMode === 'draft' && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-purple-700">
                  💾 Votre contenu sera sauvegardé en brouillon. Vous pourrez le publier ou le planifier plus tard.
                </p>
              </div>
            )}

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">📱 Aperçu :</p>
              <div className="bg-white rounded-lg p-4 border">
                {mediaPreview.length > 0 && (
                  <img src={mediaPreview[0]} alt="" className="w-full h-48 object-cover rounded-lg mb-3" />
                )}
                <p className="text-sm whitespace-pre-wrap">{content || 'Votre message...'}</p>
                {hashtags && <p className="text-xs text-purple-600 mt-2">{hashtags}</p>}
              </div>
            </div>

            {/* Platforms selected */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">📱 Plateformes sélectionnées :</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlatforms.map(platform => (
                  <span key={platform} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                ← Retour
              </button>
              <button
                onClick={() => createPost(publishMode)}
                className={`flex-2 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                  publishMode === 'draft' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-xl' :
                  publishMode === 'schedule' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-xl' :
                  'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-xl'
                }`}
              >
                {publishMode === 'draft' ? '📝 Sauvegarder le brouillon' :
                 publishMode === 'schedule' ? '⏰ Planifier la publication' :
                 '🚀 Publier maintenant !'}
              </button>
            </div>
          </div>
        )}

        {/* Scheduled Posts */}
        {posts.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">📋 Posts planifiés ({posts.length})</h3>
            <div className="space-y-3">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(post.scheduledDate).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {post.platforms && post.platforms.map((p) => (
                      <span key={p} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        @keyframes bounce-once {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
