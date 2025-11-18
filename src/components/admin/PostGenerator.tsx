"use client";

import { useState, useRef, useEffect } from 'react';
import { FaDownload, FaMagic, FaImage, FaQuoteLeft, FaLightbulb, FaTag } from 'react-icons/fa';

interface GeneratedPost {
  id: string;
  type: 'quote' | 'tip' | 'promo' | 'fact';
  title: string;
  text: string;
  caption: string;
  hashtags: string[];
  imageUrl: string;
}

const POST_TEMPLATES = {
  quote: {
    title: 'Citation inspirante',
    icon: <FaQuoteLeft />,
    examples: [
      {
        text: "La beauté commence au moment où vous décidez d'être vous-même",
        caption: "✨ Votre routine beauté doit vous ressembler !\n\nChez LAIA SKIN, nous créons des protocoles sur-mesure adaptés à votre peau et vos besoins.\n\n📍 Prenez rendez-vous dès maintenant",
        hashtags: ['beaute', 'selfcare', 'skincare', 'glowup', 'institutbeaute']
      },
      {
        text: "Investir dans votre peau, c'est investir dans votre confiance",
        caption: "💎 Prenez soin de vous, vous le méritez !\n\nDécouvrez nos soins Hydrofacial et Microneedling pour une peau éclatante.\n\n✨ Résultats visibles dès la première séance",
        hashtags: ['skincare', 'selfcare', 'beaute', 'confidence', 'glowingskin']
      },
      {
        text: "Une peau saine est une peau heureuse",
        caption: "🌸 Le secret d'une belle peau ? Des soins réguliers et adaptés !\n\nNos esthéticiennes sont là pour vous conseiller le meilleur protocole.\n\n💆‍♀️ Réservez votre consultation gratuite",
        hashtags: ['healthyskin', 'skincare', 'beaute', 'soinsvisage', 'glowup']
      }
    ]
  },
  tip: {
    title: 'Conseil beauté',
    icon: <FaLightbulb />,
    examples: [
      {
        text: "Conseil du jour : Nettoyer votre peau matin ET soir est essentiel pour un teint éclatant",
        caption: "💡 CONSEIL BEAUTÉ DU JOUR\n\nLe double nettoyage est la clé d'une peau parfaite !\n\n✅ Matin : éliminer l'excès de sébum\n✅ Soir : retirer maquillage + impuretés\n\nVenez découvrir notre soin Hydrofacial pour un nettoyage en profondeur ! 🌟",
        hashtags: ['beautytips', 'skincareroutine', 'conseils', 'hydrafacial', 'cleaningskin']
      },
      {
        text: "Le secret des pros : Appliquer la crème hydratante sur peau humide pour une meilleure absorption",
        caption: "✨ ASTUCE PRO\n\nMaximisez l'efficacité de votre crème hydratante avec cette technique simple !\n\nPeau humide = meilleure pénétration des actifs 💧\n\nNos esthéticiennes vous partagent tous leurs secrets en consultation 🤫",
        hashtags: ['beautyhacks', 'skincaretips', 'astuce', 'hydratation', 'proskintips']
      },
      {
        text: "N'oubliez jamais : La crème solaire est votre meilleur anti-âge !",
        caption: "☀️ LE CONSEIL ULTIME\n\nSPF 50 tous les jours, même en hiver, même par temps couvert !\n\nC'est LE geste qui fera toute la différence sur votre peau dans 10 ans.\n\n💪 Prenez de bonnes habitudes dès maintenant",
        hashtags: ['sunscreen', 'spf', 'antiage', 'skincare', 'protectionsolaire']
      }
    ]
  },
  promo: {
    title: 'Promotion',
    icon: <FaTag />,
    examples: [
      {
        text: "OFFRE SPÉCIALE : -20% sur votre premier soin Hydrofacial ce mois-ci !",
        caption: "🎉 OFFRE DE LANCEMENT 🎉\n\n-20% sur votre première séance Hydrofacial !\n\nProfitez de ce soin révolutionnaire à prix réduit.\n\n✨ Peau purifiée, lissée et éclatante dès la 1ère séance\n\n📅 Offre valable jusqu'au 30/11\n💌 Réservez en MP",
        hashtags: ['promo', 'offre', 'hydrafacial', 'soinvisage', 'beauteaddict']
      },
      {
        text: "NOUVEAU : Découvrez notre forfait 3 séances Microneedling à -30%",
        caption: "🚀 NOUVEAUTÉ 🚀\n\nForfait 3 séances Microneedling à prix exceptionnel !\n\n💎 -30% par rapport au tarif unitaire\n✅ Résultats optimaux garantis\n🌟 Peau raffermie et rajeunie\n\nNombre de places limité ! Contactez-nous vite 📞",
        hashtags: ['microneedling', 'forfait', 'promotion', 'antiage', 'skintreatment']
      }
    ]
  },
  fact: {
    title: 'Le saviez-vous ?',
    icon: <FaImage />,
    examples: [
      {
        text: "Le saviez-vous ? Votre peau se régénère complètement tous les 28 jours",
        caption: "🧠 LE SAVIEZ-VOUS ?\n\nVotre peau est un organe vivant qui se renouvelle constamment !\n\nC'est pourquoi des soins réguliers sont essentiels pour accompagner ce cycle naturel.\n\n💫 Nos protocoles sont conçus pour optimiser cette régénération",
        hashtags: ['didyouknow', 'skinscience', 'factskincare', 'beaute', 'education']
      },
      {
        text: "Fun fact : Votre peau est le plus grand organe de votre corps (environ 2m²)",
        caption: "🤓 FUN FACT\n\nVotre peau mérite toute votre attention ! C'est votre première barrière de protection.\n\nPrenez-en soin avec des protocoles professionnels adaptés.\n\n🌸 Consultation gratuite pour analyser vos besoins",
        hashtags: ['funfact', 'skincare', 'beaute', 'skin', 'education']
      }
    ]
  }
};

export default function PostGenerator() {
  const [selectedType, setSelectedType] = useState<'quote' | 'tip' | 'promo' | 'fact'>('quote');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generatePost = (type: keyof typeof POST_TEMPLATES) => {
    setLoading(true);

    const template = POST_TEMPLATES[type];
    const randomExample = template.examples[Math.floor(Math.random() * template.examples.length)];

    // Générer l'image avec canvas
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Définir la taille (Instagram square post)
      canvas.width = 1080;
      canvas.height = 1080;

      // Fond dégradé
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, '#d4b5a0');
      gradient.addColorStop(1, '#c9a589');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Logo/Nom en haut
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('LAIA SKIN INSTITUT', 540, 100);

      // Texte principal
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px Arial';
      ctx.textAlign = 'center';

      // Découper le texte en lignes
      const words = randomExample.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 900 && currentLine !== '') {
          lines.push(currentLine);
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      lines.push(currentLine);

      // Afficher les lignes centrées
      const lineHeight = 70;
      const startY = 540 - (lines.length * lineHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line.trim(), 540, startY + index * lineHeight);
      });

      // Type de post en bas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '32px Arial';
      ctx.fillText(template.title.toUpperCase(), 540, 980);

      // Convertir en image
      const imageUrl = canvas.toDataURL('image/png');

      const newPost: GeneratedPost = {
        id: Date.now().toString(),
        type,
        title: template.title,
        text: randomExample.text,
        caption: randomExample.caption,
        hashtags: randomExample.hashtags,
        imageUrl
      };

      setGeneratedPosts([newPost, ...generatedPosts]);
      setLoading(false);
    }, 500);
  };

  const downloadPost = (post: GeneratedPost) => {
    const link = document.createElement('a');
    link.download = `laia-skin-post-${post.id}.png`;
    link.href = post.imageUrl;
    link.click();
  };

  const copyCaption = (caption: string, hashtags: string[]) => {
    const fullText = `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    alert('Caption copiée !');
  };

  return (
    <div className="space-y-6">
      {/* Canvas caché pour générer les images */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header avec sélection de type */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6">
        <h3 className="text-xl font-serif font-bold text-[#8B6F5C] mb-4 flex items-center gap-2">
          <FaMagic className="text-purple-500" />
          Générateur de posts Instagram
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Créez des posts visuels professionnels prêts à publier en 1 clic
        </p>

        {/* Types de posts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(POST_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key as any)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedType === key
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="text-3xl mb-2">{template.icon}</div>
              <div className="text-sm font-semibold text-gray-700">{template.title}</div>
            </button>
          ))}
        </div>

        {/* Bouton de génération */}
        <button
          onClick={() => generatePost(selectedType)}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Génération en cours...
            </>
          ) : (
            <>
              <FaMagic />
              Générer un {POST_TEMPLATES[selectedType].title}
            </>
          )}
        </button>
      </div>

      {/* Posts générés */}
      {generatedPosts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#8B6F5C]">
            📸 Vos posts générés ({generatedPosts.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Image du post */}
                <div className="relative">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-auto"
                  />
                  <button
                    onClick={() => downloadPost(post)}
                    className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg hover:bg-white transition-all font-semibold text-sm flex items-center gap-2 shadow-lg"
                  >
                    <FaDownload />
                    Télécharger (1080x1080)
                  </button>
                </div>

                {/* Caption et hashtags */}
                <div className="p-5">
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-semibold text-gray-700 uppercase">Caption</h5>
                      <button
                        onClick={() => copyCaption(post.caption, post.hashtags)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                      >
                        📋 Copier
                      </button>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                      {post.caption}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Hashtags</h5>
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {generatedPosts.length === 0 && !loading && (
        <div className="text-center py-12 px-6 bg-white rounded-xl border border-gray-200">
          <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Prêt à créer ?</h3>
          <p className="text-gray-600">
            Choisissez un type de post et cliquez sur "Générer" pour créer votre premier visuel
          </p>
        </div>
      )}
    </div>
  );
}
