"use client";

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';
import { Plus, Image, Video, FileText, Upload, Download } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  scheduledDate: Date;
  status: string;
  contentType: 'post' | 'reel' | 'story';
  category?: string;
  instagramType?: string;
  facebookType?: string;
  mediaUrls?: string;
}

interface DragItem {
  type: 'post' | 'reel' | 'story';
  label: string;
  icon: any;
  color: string;
}

interface DayCategory {
  day: number; // 0 = Lundi, 6 = Dimanche
  categories: string[];
  color: string;
  contentTypes?: ('post' | 'reel' | 'story')[]; // Types de contenu suggérés
}

const contentTypes: DragItem[] = [
  { type: 'post', label: 'Publication', icon: Image, color: 'bg-blue-500' },
  { type: 'reel', label: 'Reel', icon: Video, color: 'bg-purple-500' },
  { type: 'story', label: 'Story', icon: FileText, color: 'bg-pink-500' }
];

const categories = [
  { id: 'prestations', label: 'Prestations', emoji: '💆', color: 'bg-blue-100 text-blue-800' },
  { id: 'conseils', label: 'Conseils', emoji: '💡', color: 'bg-green-100 text-green-800' },
  { id: 'avant-apres', label: 'Avant/Après', emoji: '✨', color: 'bg-purple-100 text-purple-800' },
  { id: 'personnel', label: 'Personnel', emoji: '💕', color: 'bg-pink-100 text-pink-800' },
  { id: 'promotion', label: 'Promotion', emoji: '🔥', color: 'bg-orange-100 text-orange-800' },
  { id: 'temoignage', label: 'Témoignage', emoji: '⭐', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'coulisses', label: 'Coulisses', emoji: '📸', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'nouveaute', label: 'Nouveauté', emoji: '🎁', color: 'bg-rose-100 text-rose-800' }
];

const defaultDayCategories: DayCategory[] = [
  { day: 0, categories: ['prestations', 'nouveaute'], color: 'border-blue-300', contentTypes: ['post', 'reel'] }, // Lundi
  { day: 1, categories: ['conseils', 'avant-apres'], color: 'border-green-300', contentTypes: ['reel', 'story'] }, // Mardi
  { day: 2, categories: ['promotion', 'temoignage'], color: 'border-orange-300', contentTypes: ['post'] }, // Mercredi
  { day: 3, categories: ['prestations', 'coulisses'], color: 'border-blue-300', contentTypes: ['story', 'reel'] }, // Jeudi
  { day: 4, categories: ['personnel', 'conseils'], color: 'border-pink-300', contentTypes: ['post', 'story'] }, // Vendredi
  { day: 5, categories: ['promotion', 'avant-apres'], color: 'border-purple-300', contentTypes: ['reel'] }, // Samedi
  { day: 6, categories: ['personnel', 'coulisses'], color: 'border-pink-300', contentTypes: ['story'] } // Dimanche
];

export default function DragDropCalendar() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    date: Date;
    contentType: 'post' | 'reel' | 'story';
  } | null>(null);
  const [dayCategories, setDayCategories] = useState<DayCategory[]>(defaultDayCategories);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [contentSuggestions, setContentSuggestions] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [favoriteTimeSlots, setFavoriteTimeSlots] = useState<string[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<Array<{url: string, type: 'image' | 'video', publicId: string}>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadPosts();
    loadPreferencesFromStorage();
  }, [selectedWeek]);

  const loadPreferencesFromStorage = () => {
    const saved = localStorage.getItem('socialMediaPreferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        setDayCategories(preferences.map((pref: any) => ({
          day: pref.day,
          categories: pref.categories || [],
          contentTypes: pref.contentTypes || [],
          color: defaultDayCategories.find(d => d.day === pref.day)?.color || 'border-gray-300'
        })));
      } catch (e) {
        console.error('Erreur chargement préférences:', e);
      }
    }
  };

  // Auto-publish scheduled posts
  useEffect(() => {
    const checkAndPublish = async () => {
      try {
        const response = await fetch('/api/admin/social-media/auto-publish', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.count > 0) {
            console.log(`✅ ${data.count} posts publiés automatiquement`);
            // Reload posts to update the UI
            await loadPosts();
          }
        }
      } catch (error) {
        console.error('Erreur auto-publication:', error);
      }
    };

    // Check every minute
    const interval = setInterval(checkAndPublish, 60000);

    // Check immediately on mount
    checkAndPublish();

    return () => clearInterval(interval);
  }, []);

  const loadPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const allPosts = await response.json();
        const weekPosts = allPosts.filter((post: any) => {
          const date = new Date(post.scheduledDate);
          const start = getStartOfWeek(selectedWeek);
          const end = getEndOfWeek(selectedWeek);
          return date >= start && date <= end;
        });
        setPosts(weekPosts);
      }
    } catch (error) {
      console.error('Erreur chargement posts:', error);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getEndOfWeek = (date: Date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59);
    return end;
  };

  const getWeekDays = () => {
    const start = getStartOfWeek(selectedWeek);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getPostsForDay = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const previousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const handleDragStart = (item: DragItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (date: Date) => {
    if (draggedItem) {
      setModalData({ date, contentType: draggedItem.type });
      setShowModal(true);
      setDraggedItem(null);
    }
  };

  const handleMediaUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedMedia(prev => [...prev, {
          url: data.url,
          type: data.type,
          publicId: data.publicId
        }]);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = async (publicId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/social-media/upload?publicId=${publicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUploadedMedia(prev => prev.filter(m => m.publicId !== publicId));
    } catch (error) {
      console.error('Erreur suppression média:', error);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const posts = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const post: any = {};

      headers.forEach((header, index) => {
        post[header] = values[index] || '';
      });

      posts.push(post);
    }

    return posts;
  };

  const handleImportCSV = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const parsedPosts = parseCSV(text);

      let successCount = 0;
      let errorCount = 0;

      for (const csvPost of parsedPosts) {
        try {
          // Valider les champs requis
          if (!csvPost.titre || !csvPost.contenu || !csvPost.date || !csvPost.heure || !csvPost.plateformes) {
            console.warn('Post ignoré (champs manquants):', csvPost);
            errorCount++;
            continue;
          }

          // Parser la date
          const [day, month, year] = csvPost.date.split('/');
          const [hours, minutes] = csvPost.heure.split(':');
          const scheduledDate = new Date(year, month - 1, day, hours, minutes);

          if (isNaN(scheduledDate.getTime())) {
            console.warn('Date invalide:', csvPost.date, csvPost.heure);
            errorCount++;
            continue;
          }

          // Déterminer le type de contenu
          const contentType = csvPost.type?.toLowerCase() === 'reel' ? 'reel' :
                            csvPost.type?.toLowerCase() === 'story' ? 'story' : 'post';

          // Créer le post
          const token = localStorage.getItem('token');
          const response = await fetch('/api/admin/social-media', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: csvPost.titre,
              content: csvPost.contenu,
              platform: csvPost.plateformes,
              category: csvPost.categorie || null,
              contentType: contentType,
              scheduledDate: scheduledDate.toISOString(),
              status: 'scheduled',
              hashtags: csvPost.hashtags || null,
              instagramType: contentType === 'reel' ? 'reel' : contentType === 'story' ? 'story' : 'post',
              facebookType: contentType === 'reel' ? 'video' : 'post'
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          console.error('Erreur création post:', err);
          errorCount++;
        }
      }

      await loadPosts();
      setShowImportModal(false);
      alert(`✅ Import terminé !\n${successCount} posts créés\n${errorCount} erreurs`);
    } catch (error) {
      console.error('Erreur import CSV:', error);
      alert('❌ Erreur lors de l\'import du CSV. Vérifiez le format du fichier.');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadCSVTemplate = () => {
    const template = `date,heure,type,titre,contenu,plateformes,categorie,hashtags
01/01/2025,09:00,post,Titre de votre publication,Contenu de votre publication,instagram,prestations,#beauty #skincare
02/01/2025,14:00,reel,Titre de votre reel,Description du reel,"instagram,tiktok",conseils,#tutorial #tips
03/01/2025,18:00,story,Titre de votre story,Contenu de la story,instagram,personnel,#behindthescenes`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_calendrier_posts.csv';
    link.click();
  };

  const handleCreatePost = async (formData: any) => {
    try {
      const token = localStorage.getItem('token');

      // Combine date and time
      const scheduledDate = new Date(modalData?.date || new Date());
      if (formData.scheduledTime) {
        const [hours, minutes] = formData.scheduledTime.split(':');
        scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      // Determine status
      const status = formData.saveAsDraft ? 'draft' : 'scheduled';

      // Parse links if provided
      let linksArray = [];
      if (formData.links) {
        linksArray = formData.links.split('\n').filter((link: string) => link.trim());
      }

      const response = await fetch('/api/admin/social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          platform: formData.platform,
          category: formData.category,
          contentType: modalData?.contentType,
          scheduledDate: scheduledDate.toISOString(),
          status: status,
          notes: formData.notes || null,
          links: linksArray.length > 0 ? JSON.stringify(linksArray) : null,
          hashtags: formData.hashtags || null,
          mediaUrls: uploadedMedia.length > 0 ? JSON.stringify(uploadedMedia.map(m => m.url)) : null,
          instagramType: modalData?.contentType === 'reel' ? 'reel' : modalData?.contentType === 'story' ? 'story' : 'post',
          facebookType: modalData?.contentType === 'reel' ? 'video' : 'post'
        })
      });

      if (response.ok) {
        await loadPosts();
        setShowModal(false);
        setModalData(null);
        setShowAdvancedOptions(false);
        setContentSuggestions([]);
        setUploadedMedia([]);
        setSelectedPlatforms([]);
      }
    } catch (error) {
      console.error('Erreur création post:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getDayOfWeek = (date: Date): number => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1; // Convert to Monday = 0
  };

  const getCategoriesForDay = (date: Date) => {
    const dayOfWeek = getDayOfWeek(date);
    const dayCat = dayCategories.find(dc => dc.day === dayOfWeek);
    return dayCat || { day: dayOfWeek, categories: [], color: 'border-gray-300' };
  };

  const updateDayCategories = (day: number, selectedCats: string[]) => {
    setDayCategories(prev =>
      prev.map(dc => dc.day === day ? { ...dc, categories: selectedCats } : dc)
    );
  };

  const updateDayContentTypes = (day: number, selectedTypes: ('post' | 'reel' | 'story')[]) => {
    setDayCategories(prev =>
      prev.map(dc => dc.day === day ? { ...dc, contentTypes: selectedTypes } : dc)
    );
  };

  const getOptimalTimesForPlatforms = (platforms: string[]) => {
    const optimalTimes: Record<string, Array<{time: string, reason: string, engagement: string}>> = {
      instagram: [
        { time: "09:00", reason: "Pic matinal - café scroll", engagement: "⭐⭐⭐⭐⭐" },
        { time: "12:30", reason: "Pause déjeuner", engagement: "⭐⭐⭐⭐" },
        { time: "18:00", reason: "Sortie du travail", engagement: "⭐⭐⭐⭐⭐" },
        { time: "20:30", reason: "Prime time soirée", engagement: "⭐⭐⭐⭐" }
      ],
      facebook: [
        { time: "08:00", reason: "Check matinal", engagement: "⭐⭐⭐⭐" },
        { time: "13:00", reason: "Pause déjeuner prolongée", engagement: "⭐⭐⭐⭐⭐" },
        { time: "19:00", reason: "Retour à la maison", engagement: "⭐⭐⭐⭐" }
      ],
      tiktok: [
        { time: "07:00", reason: "Réveil - scroll au lit", engagement: "⭐⭐⭐⭐⭐" },
        { time: "12:00", reason: "Pause déj rapide", engagement: "⭐⭐⭐⭐" },
        { time: "17:00", reason: "Trajet retour", engagement: "⭐⭐⭐⭐⭐" },
        { time: "21:00", reason: "Before sleep scroll", engagement: "⭐⭐⭐⭐⭐" }
      ]
    };

    if (platforms.length === 0) return [];

    // Si plusieurs plateformes, trouve les créneaux communs
    if (platforms.length > 1) {
      const commonTimes = [
        { time: "09:00", reason: "Meilleur créneau multi-plateforme", engagement: "⭐⭐⭐⭐⭐" },
        { time: "12:30", reason: "Pause déjeuner universelle", engagement: "⭐⭐⭐⭐⭐" },
        { time: "18:00", reason: "Prime time tous réseaux", engagement: "⭐⭐⭐⭐⭐" }
      ];
      return commonTimes;
    }

    return optimalTimes[platforms[0]] || [];
  };

  const generateContentSuggestions = (contentType: 'post' | 'reel' | 'story', category: string) => {
    const trendingSuggestions: Record<string, Record<string, Array<{title: string, content: string, trending: string}>>> = {
      post: {
        prestations: [
          {
            title: "🌟 Le Glass Skin : la tendance coréenne qui fait fureur",
            content: "Obtenez une peau translucide et lumineuse comme du verre ! 💎\n\n✨ Notre soin signature combine :\n- Hydratation en profondeur\n- Peeling enzymatique doux\n- Massage lifting coréen\n- Masque illuminateur\n\nRésultat : Une peau rebondie, lisse et éclatante qui reflète la lumière naturellement.\n\n📍 Découvrez ce soin tendance maintenant !\n\n#glassskin #kbeauty #peauperfaite #soinduvivsage #laiaskin",
            trending: "🔥 Tendance K-Beauty 2024"
          },
          {
            title: "💆‍♀️ Facial Sculpting : sculptez votre visage naturellement",
            content: "Le contouring mais version soin ! Le facial sculpting est LA tendance pour lifter et sculpter sans injection 🙌\n\n🎯 Les bénéfices :\n✓ Effet lifting naturel\n✓ Ovale du visage redéfini\n✓ Drainage lymphatique\n✓ Réduction des tensions\n\nNotre protocole exclusif combine massage Gua Sha, ventouses et techniques japonaises Kobido.\n\nVous méritez un visage sculpté et rajeuni naturellement !\n\n#facialsculpting #guasha #kobido #liftingnaturel #beautenaturelle",
            trending: "⭐ Technique virale Instagram"
          },
          {
            title: "🧊 Cryothérapie faciale : le froid au service de votre peau",
            content: "Le secret des célébrités pour une peau fraîche et tonique ? La cryothérapie ! ❄️\n\n💙 Les bienfaits du froid :\n→ Resserre les pores instantanément\n→ Booste la circulation\n→ Réduit les inflammations\n→ Effet tenseur immédiat\n\nNotre soin cryo-lifting combine le pouvoir du froid avec des actifs concentrés pour un effet wow garanti.\n\nPrête à tester cette tendance glaciale ? 🧊\n\n#cryotherapie #cryofacial #tendancebeaute #soinfroid #peauparfaite",
            trending: "❄️ Viral TikTok 2024"
          }
        ],
        conseils: [
          {
            title: "🌞 Skincare Layering : l'art d'appliquer ses soins (méthode coréenne)",
            content: "Vous appliquez peut-être mal vos produits ! 😱\n\nVoici la méthode K-Beauty qui maximise l'efficacité de chaque produit :\n\n1️⃣ Nettoyant doux\n2️⃣ Tonique (tapotez, ne frottez pas !)\n3️⃣ Essence (le secret coréen)\n4️⃣ Sérum (du plus léger au plus riche)\n5️⃣ Contour des yeux\n6️⃣ Crème hydratante\n7️⃣ SPF le matin / huile le soir\n\n⏱️ Attendez 30 secondes entre chaque étape pour une absorption optimale.\n\nSauvegardez ce post pour ne plus faire d'erreurs ! 💾\n\n#skincarelayering #routinebeaute #kbeauty #conseilsbeaute #peauparfaite",
            trending: "📚 Méthode validée par les dermatologues"
          },
          {
            title: "💧 Skin Cycling : la routine par cycles qui révolutionne le skincare",
            content: "Stop à l'overdose de produits ! Le skin cycling respecte votre peau 🔄\n\n📅 Le cycle de 4 jours :\n\nJOUR 1 : Exfoliation (acides)\nJOUR 2 : Rétinoïdes (anti-âge)\nJOUR 3 : Récupération (hydratation)\nJOUR 4 : Récupération (apaisant)\n\nPuis on recommence ! 🔁\n\n✨ Les avantages :\n→ Moins d'irritations\n→ Meilleure tolérance\n→ Résultats optimisés\n→ Barrière cutanée préservée\n\nLa patience, c'est la clé d'une belle peau !\n\n#skincycling #routineskincare #peausensible #conseilsdermo #beauteconsciente",
            trending: "🌟 Méthode TikTok 50M vues"
          },
          {
            title: "🧬 Skin Barrier : pourquoi votre barrière cutanée est essentielle",
            content: "Rougeurs, tiraillements, sensibilité ? Votre barrière cutanée est peut-être fragilisée ! 🆘\n\n🛡️ Qu'est-ce que la barrière cutanée ?\nC'est la première défense de votre peau contre les agressions extérieures.\n\n⚠️ Signes d'une barrière affaiblie :\n- Peau qui réagit à tout\n- Déshydratation constante\n- Rougeurs persistantes\n- Sensations d'inconfort\n\n💚 Comment la réparer :\n✓ Céramides + niacinamide\n✓ Nettoyants doux uniquement\n✓ Stop aux gommages\n✓ Hydratation renforcée\n\nVotre peau vous remerciera ! 🙏\n\n#skinbarrier #barrierecu tanée #peausensible #ceramides #soinsdoux",
            trending: "🔬 Tendance dermo-cosmétique"
          }
        ],
        'avant-apres': [
          {
            title: "✨ Transformation acné : 8 semaines de soins ciblés",
            content: "De l'acné sévère à une peau nette et lumineuse ! 🌟\n\n📸 Résultats après 8 semaines :\n→ 90% d'imperfections en moins\n→ Cicatrices estompées\n→ Texture affinée\n→ Confiance retrouvée ❤️\n\n🎯 Notre protocole anti-acné :\n1. Nettoyage profond LED\n2. Peeling adapté\n3. Extraction douce\n4. Soin apaisant\n5. Routine personnalisée\n\nVous aussi, retrouvez une peau saine ! L'acné n'est pas une fatalité 💪\n\n#transformationacne #avantapres #peaunette #traitement acne #resultatreels",
            trending: "💥 Transformation virale"
          },
          {
            title: "🎂 Anti-âge naturel : -10 ans sans chirurgie ni injection",
            content: "50 ans mais une peau de 40 ! Le secret ? La régularité 🕐\n\n📊 Résultats visibles après 6 mois :\n✓ Rides d'expression atténuées\n✓ Ovale du visage redéfini\n✓ Taches pigmentaires éclaircies\n✓ Peau repulpée et ferme\n\n🌿 Protocole 100% naturel :\n- Soins LED photothérapie\n- Massages sculptants\n- Cosmétiques bio actifs\n- Hygiène de vie optimisée\n\nLa beauté n'a pas d'âge, elle se cultive ! 🌸\n\n#antiagenat urel #transformationvisage #beauteaunaturel #50ansrajeunie #soinsnaturels",
            trending: "🌟 Alternative naturelle aux injections"
          },
          {
            title: "💎 Glow Up complet : de la peau terne à la peau de rêve",
            content: "De fatiguée à radieuse en 30 jours ! ✨\n\nLe before : teint gris, cernes, texture irrégulière\nLe after : éclat naturel, peau lisse, coup de jeune 🌟\n\n🎁 Le secret du glow ?\n→ Exfoliation régulière (2x/semaine)\n→ Soins vitamine C\n→ Hydratation intense\n→ Massage facial quotidien\n→ Sommeil de qualité\n\nVotre peau est le reflet de vos soins ! Investissez en vous 💕\n\n#glowup #peauradieuse #transformationbeaute #eclat naturel #selfcare",
            trending: "✨ Glow challenge viral"
          }
        ],
        personnel: [
          {
            title: "💭 Pourquoi j'ai choisi la slow beauty plutôt que les tendances rapides",
            content: "Dans un monde où tout va vite, j'ai fait le choix de la slow beauty 🌿\n\nCe que ça signifie pour vous :\n\n🕐 Prendre le temps\nChaque soin dure minimum 1h. Pas de précipitation, juste du bien-être.\n\n🌱 Privilégier le naturel\nMoins de produits, mais mieux choisis. Qualité > Quantité.\n\n💚 Écouter votre peau\nVotre peau est unique, vos soins aussi. Zéro protocole industriel.\n\n🤝 Créer une vraie relation\nVous n'êtes pas un numéro, vous êtes MA cliente.\n\nLa beauté, c'est un chemin, pas une course. Et vous ? Vous êtes team slow ou fast beauty ? 💬\n\n#slowbeauty #beauteconsciente #beauteaunatural #philosophie #authentique",
            trending: "🌿 Mouvement slow beauty"
          },
          {
            title: "🎯 5 ans d'entrepreneuriat : mes leçons et mes échecs",
            content: "Être esthéticienne indépendante, c'est pas toujours glamour ! Spoiler : il y a eu des larmes 😅\n\n❌ Mes erreurs :\n- Vouloir plaire à tout le monde (impossible !)\n- Sous-estimer la gestion (la compta, c'est pas fun)\n- Ne pas oser augmenter mes prix (erreur de débutante)\n\n✅ Ce que j'ai appris :\n→ Rester authentique attire les bonnes personnes\n→ Investir en formation = investir en soi\n→ Dire non, c'est OK\n→ La qualité prime sur la quantité\n\nAujourd'hui, je suis fière du chemin parcouru. Et vous, entrepreneurs, quelle est votre plus grande leçon ? 💬\n\n#entrepreneur #estheticienne #businessbeaute #realite #authenticite",
            trending: "💼 Réalité entrepreneuriale"
          },
          {
            title: "🌸 Ma morning routine de boss lady esthéticienne",
            content: "5h30 du matin et c'est parti pour une journée beauté ! ☀️\n\nComment je commence ma journée :\n\n5h30 : Réveil en douceur (pas de snooze !)\n5h45 : Routine skincare complète (je pratique ce que je prêche !)\n6h00 : Méditation + visualisation (5 min suffisent)\n6h15 : Petit déj équilibré (smoothie vert forever 🥤)\n6h45 : Sport léger (yoga ou marche)\n7h30 : Arrivée au salon, préparation des cabines\n8h00 : Première cliente !\n\n💫 Mon secret : prendre soin de moi AVANT de prendre soin des autres.\n\nEt vous, c'est quoi votre morning routine ? ☀️\n\n#morningroutine #bossla dy #estheticienne #routine #motivation",
            trending: "⏰ That Girl aesthetic"
          }
        ],
        promotion: [
          {
            title: "🎉 BLACK FRIDAY BEAUTY : -40% sur tous les forfaits !",
            content: "C'EST MAINTENANT OU JAMAIS ! ⚡\n\n🖤 OFFRE BLACK FRIDAY 🖤\n-40% sur TOUS les forfaits\nValable jusqu'au 30/11 uniquement !\n\n💝 Nos best-sellers :\n\n✨ Forfait Éclat (5 soins) : 299€ au lieu de 499€\n💎 Forfait Premium (10 soins) : 499€ au lieu de 899€\n🌟 Forfait VIP (15 soins) : 699€ au lieu de 1299€\n\n🎁 BONUS : 1 soin offert pour tout achat de forfait !\n\n⏰ Places limitées à 20 forfaits !\n\n👉 Réservez maintenant en commentaire ou par MP\n\n#blackfriday #promo #forfaitbeaute #bonplan #offrelimitee",
            trending: "🛍️ Black Friday rush"
          },
          {
            title: "💝 Fête des Mères : offrez-lui un moment rien qu'à elle",
            content: "Votre maman le mérite ! 💕\n\n🎁 COFFRETS FÊTE DES MÈRES 🎁\n\n🌸 Coffret Douceur - 89€\n1 soin visage relaxant + produits de soin\n\n💐 Coffret Maman d'Amour - 149€\n1 soin signature + massage + bougie parfumée\n\n👑 Coffret Reine des Mères - 249€\n2 soins au choix + rituel thé + carte cadeau 50€\n\n✨ Inclus dans tous les coffrets :\n→ Emballage cadeau premium\n→ Carte personnalisée\n→ Validité 1 an\n→ Réservation prioritaire\n\n💌 Commandez avant le 15/05 : -15% avec le code MAMOUR\n\n#fetedesmeres #cadeaumaman #coffretbeaute #ideecadeau #maman",
            trending: "💐 Événement saisonnier"
          },
          {
            title: "🎊 Parrainage : gagnez 50€ en faisant découvrir Laia Skin",
            content: "Partagez l'amour (et gagnez des sous) ! 💸\n\n🎁 NOUVEAU PROGRAMME PARRAINAGE 🎁\n\nVoici comment ça marche :\n\n1️⃣ Vous parrainez une amie\n2️⃣ Elle réserve un soin (minimum 70€)\n3️⃣ Vous gagnez TOUS LES DEUX 50€ en bons d'achat ! 🎉\n\n💰 Cumul illimité !\n5 amies parrainées = 250€ de soins gratuits !\n\n🌟 Conditions :\n→ Nouvelle cliente uniquement\n→ Valable sur le prochain soin\n→ Cumulable avec forfaits\n\n👉 Demandez votre code parrain unique !\n\nQui sera votre première filleule ? 😊\n\n#parrainage #bonplan #recompense #partage #beautyaddict",
            trending: "🤝 Marketing viral"
          }
        ],
        temoignage: [
          {
            title: "⭐ Avis 5 étoiles : 'Ma peau n'a jamais été aussi belle'",
            content: "Ce genre de message me fait vibrer ! 💕\n\n📝 Témoignage de Marie, 34 ans :\n\n'Après des années de galère avec mon acné adulte, j'avais perdu espoir. J'ai découvert Laia Skin sur Instagram et j'ai tenté le coup.\n\nAujourd'hui, après 3 mois de soins réguliers, je ne me cache plus derrière le maquillage. Ma peau est nette, lumineuse, et surtout JE ME SENS BELLE.\n\nMerci Célia pour ton écoute, ta bienveillance et ton expertise. Tu as changé ma vie, littéralement. ❤️'\n\n🙏 Merci Marie pour ta confiance. C'est pour ces moments que j'aime mon métier.\n\nVous aussi, vous méritez de vous sentir bien dans votre peau !\n\n#temoignage #avis5etoiles #transformation #merci #reconnaissance",
            trending: "💬 Preuve sociale puissante"
          },
          {
            title: "💍 'J'étais sublime le jour J grâce à la préparation mariée'",
            content: "Les larmes de joie, édition mariage ! 😭💕\n\n👰 Témoignage de Sophie, mariée en septembre :\n\n'J'avais peur que ma peau stressée me joue des tours pour mon mariage. Célia a créé un protocole sur-mesure 3 mois avant le jour J.\n\nLe résultat ? Une peau de rêve sur toutes les photos ! Pas une seule imperfection. Mon make-up artist était impressionnée.\n\nLe plus beau jour de ma vie avec la plus belle peau de ma vie. Merci infiniment ! 💐'\n\n✨ Préparez votre mariage avec notre forfait Mariée (6 soins personnalisés)\n\nÀ réserver 3-4 mois avant le jour J !\n\n#mariee #preparationmariage #beautedejour #temoignage #mariage2024",
            trending: "💒 Niche mariée rentable"
          }
        ],
        coulisses: [
          {
            title: "📦 Unboxing : j'ai reçu les nouveaux appareils tendance !",
            content: "Devinez ce qui vient d'arriver ? 😍\n\n📦 Dans les cartons aujourd'hui :\n\n✨ Appareil LED nouvelle génération\n(7 couleurs, résultats x2 plus rapides !)\n\n🌟 Radiofréquence micro-needling\n(le saint graal anti-âge sans aiguilles)\n\n💎 Cryolipolyse visage\n(bye bye double menton !)\n\nInvestissement : 15 000€\nMon compte en banque : 💀\nMais VOUS allez adorer : 📈\n\n🎥 Swipe pour voir l'unboxing complet !\n\nQuel appareil vous tente le plus ? Dites-moi en commentaire ! 💬\n\n#nouveautes #unboxing #materielesthétique #investissement #coulisses",
            trending: "📦 Format unboxing populaire"
          },
          {
            title: "🎓 Formation du jour : j'apprends le massage Kobido",
            content: "Une journée de formation intensive ! 🤯\n\nAujourd'hui, j'apprends le massage facial japonais Kobido :\n\n→ 3h30 de pratique intense\n→ 48 mouvements différents à maîtriser\n→ Les mains qui tremblent (normal !)\n→ Mais QUEL résultat sur le modèle ! 😍\n\n📚 Pourquoi je me forme encore ?\n\nParce que dans ce métier, se reposer sur ses acquis = régresser.\n\nLes techniques évoluent, la beauté évolue, JE dois évoluer avec ! 💪\n\nVous aurez ce nouveau soin dès la semaine prochaine !\n\n#formation #kobido #massagefacial #evolution #passion",
            trending: "📚 Expertise et formation"
          }
        ],
        nouveaute: [
          {
            title: "🚨 NOUVEAU : le soin Carbon Laser débarque chez Laia Skin !",
            content: "LE soin qui fait le buzz sur TikTok est enfin chez nous ! 🔥\n\n🖤 C'EST QUOI LE CARBON LASER ?\n\nUn soin révolutionnaire qui combine :\n→ Masque au charbon actif\n→ Laser Q-Switched\n→ Effet peeling instantané\n\n✨ LES RÉSULTATS :\n✓ Pores resserrés immédiatement\n✓ Peau lumineuse et nette\n✓ Teint unifié\n✓ Zéro éviction sociale\n✓ Parfait avant un événement !\n\n💰 Prix de lancement : 89€ (au lieu de 129€)\nValable jusqu'au 31/12 !\n\n🎯 Idéal pour : pores dilatés, teint terne, points noirs, brillances\n\n👉 Réservez votre soin découverte maintenant !\n\n#carbonlaser #nouveaute #soinrevolutionnaire #tendance2024 #hollywood",
            trending: "🔥 Viral TikTok 100M vues"
          },
          {
            title: "💚 Nouveau : la gamme de cosmétiques Laia Skin est là !",
            content: "J'ai créé MA propre ligne de soins ! 🎉\n\nAprès 2 ans de R&D, voici les 5 produits qui vont révolutionner votre routine :\n\n🌿 Le Nettoyant Doux (29€)\nTexture gelée, formule sans sulfate\n\n💧 Le Sérum Éclat (49€)\nVitamine C + acide férulique + niacinamide\n\n✨ La Crème Velours (39€)\nHydratation 24h, fini mat naturel\n\n🌙 L'Huile de Nuit (45€)\n9 huiles précieuses, régénération intense\n\n☀️ La Protection SPF50 (35€)\nTexture invisible, peaux sensibles OK\n\n🎁 Kit découverte complet : 159€ (au lieu de 197€)\n\n💚 100% fabriqué en France, vegan, clean beauty\n\nLien dans la bio pour découvrir la gamme ! 🛒\n\n#laiaskincare #nouvellegamme #cosmetiques #madeinfrance #cleanbeauty",
            trending: "🌟 Lancement de marque"
          }
        ]
      },
      reel: {
        prestations: [
          {
            title: "🎬 ASMR : soin du visage complet en 30 secondes",
            content: "Les sons du soin qui apaisent... 🎧\n\n[Voix off calme]\n'Laissez-vous transporter...'\n\n→ Nettoyage doux à l'eau florale\n→ Gommage enzymatique léger\n→ Application du sérum vitaminé\n→ Massage facial sculptant\n→ Masque hydratant apaisant\n→ Vaporisation d'eau thermale\n→ Crème velours finale\n\nMusique : Lo-fi relaxante\nFormat : 30 sec time-lapse\nHook : 'Ce son va vous endormir'\n\n#asmr #soinduvivasge #relax #satisfying #beautyasmr",
            trending: "🎧 ASMR beauty viral"
          },
          {
            title: "⏱️ TRANSFORMATION 60 SECONDES : avant/après Gua Sha",
            content: "Un visage lifté en 1 minute ? Regardez ! 😱\n\n[Reel dynamique, musique tendance]\n\nBefore : visage gonflé, cernes, fatigué\n\n[Technique Gua Sha accélérée]\n→ Drainage lymphatique rapide\n→ Mouvements lift sculptants\n→ Pression points d'acupression\n\nAfter : visage sculpté, regard ouvert, glow ✨\n\nHook : 'Non ce n'est PAS du FaceTune'\n\nMusique : Trending audio du moment\nTransition : Jump cut avant/après\n\n#guasha #transformation #facialsclupting #beforeafter #beauty",
            trending: "⚡ Transformation rapide"
          }
        ],
        conseils: [
          {
            title: "❌ 5 ERREURS que tu fais avec ton sérum (et comment les corriger)",
            content: "[Reel énergique, musique punchy]\n\n❌ Erreur #1 : Tu en mets trop\n✅ Solution : 3-4 gouttes suffisent !\n\n❌ Erreur #2 : Tu l'appliques sur peau sèche\n✅ Solution : Peau humide = absorption x10 !\n\n❌ Erreur #3 : Tu frottes fort\n✅ Solution : Tapoter doucement !\n\n❌ Erreur #4 : Tu sautes le cou\n✅ Solution : Descendre jusqu'au décolleté !\n\n❌ Erreur #5 : Tu attends pas assez\n✅ Solution : 60 secondes minimum avant la crème !\n\nHook : 'Arrête de gaspiller ton sérum à 60€'\n\nFormat : Texte dynamique + démonstration\nMusique : Trending sound\n\n#serum #erreurbeaute #conseilsdermo #skincaretips #beauty101",
            trending: "🎯 Format erreurs/solutions viral"
          },
          {
            title: "🧪 EXPÉRIENCE : je teste les patchs anti-rides pendant 30 jours",
            content: "[Série de Reels – Jour 1 à 30]\n\nJOUR 1 :\n'Je teste les fameux patchs TikTok pendant 1 mois complet. Vraie perte de temps ou vraie solution ?'\n\n[Photo des rides jour 1]\n\nJOUR 15 :\n'Première surprise...'\n[Zoom sur la différence]\n\nJOUR 30 :\n'Le verdict final qui m'a choquée'\n[Before/After côte à côte]\n\nFormat : Daily vlog style\nMusique : Suspense puis victoire\nEngagement : 'Devinez le résultat en commentaire'\n\n#test30jours #experience #antirides #patchs #resultat",
            trending: "📅 Challenge 30 jours"
          }
        ],
        'avant-apres': [
          {
            title: "😱 ACNÉ SÉVÈRE → PEAU PARFAITE : les 90 jours qui ont tout changé",
            content: "[Reel émotionnel, musique inspirante]\n\n📸 Jour 0 : Close-up peau acnéique\n'J'en pouvais plus de me cacher...'\n\n📸 Jour 30 : Premières améliorations\n'Les inflammations diminuent'\n\n📸 Jour 60 : Changement visible\n'Je recommence à me regarder dans le miroir'\n\n📸 Jour 90 : Transformation complète\n'Je suis moi-même maintenant' 💕\n\n[Voix de la cliente en témoignage]\n\nProtocole sur-mesure de 12 semaines\n\nMusique : Emotional progression\nFormat : Chronologique avec émoti on\n\n#transformation #acne #guerison #confiance #beforeafter",
            trending: "💔 Story telling émotionnel"
          }
        ]
      },
      story: {
        coulisses: [
          {
            title: "☀️ Viens préparer le salon avec moi ce matin !",
            content: "[Story authentique style vlog]\n\n6h45 : Arrivée au salon encore endormie ☕\n7h00 : J'allume les lumières tamisées ✨\n7h15 : Préparation cabine 1 (lingettes chaudes!)\n7h30 : Vérification des stocks produits\n7h45 : Petit café avec vue sur le planning 📅\n8h00 : Ma première cliente arrive ! 💕\n\nSticker poll : 'Vous êtes plutôt matin ou soir ?'\n\nFormat : Time-lapse + musique douce\nFiltre : Lumineux et chaleureux\n\n#morningroutine #coulisses #estheticienne #behindthescenes #salon",
            trending: "🌅 Morning routine authentic"
          },
          {
            title: "📦 UNBOXING en direct : découverte des nouveaux produits",
            content: "[Story interactive en direct]\n\n'Je reçois ma commande de produits bio, on ouvre ensemble ?'\n\n📦 Carton 1 : Gamme visage\nSticker: 'Lequel tester en premier ?'\n\n📦 Carton 2 : Appareils\nQuestion : 'Vous connaissez le microneedling ?'\n\n📦 Carton 3 : Surprise!\n'Devinez ce que c'est !'\n\nFormat : Multi-stories (8-10 slides)\nEngagement : Polls + questions à chaque slide\n\n#unboxing #nouveautes #live #interaction #suspense",
            trending: "🎁 Unboxing interactif"
          }
        ],
        promotion: [
          {
            title: "⚡ FLASH SALE 2H : -50% sur le soin signature !",
            content: "[Story urgente, visuel dynamique]\n\n🔥 FLASH SALE 🔥\nPendant 2H SEULEMENT !\n\n-50% sur le soin Éclat Suprême\n75€ au lieu de 150€\n\nSwipe up pour réserver ! 👆\n[Lien de réservation]\n\nCompteur : 2:00:00\n\nSticker : SWIPE UP maintenant !\n\nFormat : Visuel impactant rouge/or\nUrgence : Countdown timer\n\n#flashsale #promo #derniereminute #bonplan #vitevitvite",
            trending: "⏰ Urgence et rareté"
          }
        ]
      }
    };

    return trendingSuggestions[contentType]?.[category] || [
      {
        title: "Créez un contenu unique",
        content: "Partagez votre expertise avec authenticité",
        trending: "💡 Personnalisez votre message"
      }
    ];
  };

  const getOptimalPostingTimes = (platforms: string[], dayOfWeek: number) => {
    // Horaires optimaux par plateforme (basés sur les études d'engagement)
    const optimalSchedule: Record<string, Record<number, string[]>> = {
      instagram: {
        0: ['09:00', '12:00', '19:00'], // Lundi
        1: ['09:00', '12:00', '19:00'], // Mardi
        2: ['09:00', '13:00', '19:00'], // Mercredi
        3: ['09:00', '13:00', '19:00'], // Jeudi
        4: ['09:00', '13:00', '17:00'], // Vendredi
        5: ['11:00', '14:00', '20:00'], // Samedi
        6: ['10:00', '13:00', '19:00']  // Dimanche
      },
      facebook: {
        0: ['09:00', '13:00', '15:00'],
        1: ['09:00', '13:00', '15:00'],
        2: ['09:00', '13:00', '15:00'],
        3: ['09:00', '13:00', '15:00'],
        4: ['09:00', '13:00', '15:00'],
        5: ['10:00', '12:00', '15:00'],
        6: ['12:00', '15:00', '19:00']
      },
      tiktok: {
        0: ['07:00', '12:00', '19:00'],
        1: ['07:00', '12:00', '19:00'],
        2: ['07:00', '12:00', '19:00'],
        3: ['07:00', '12:00', '19:00'],
        4: ['07:00', '12:00', '19:00'],
        5: ['09:00', '14:00', '21:00'],
        6: ['09:00', '14:00', '21:00']
      },
      linkedin: {
        0: ['08:00', '12:00', '17:00'],
        1: ['08:00', '12:00', '17:00'],
        2: ['08:00', '12:00', '17:00'],
        3: ['08:00', '12:00', '17:00'],
        4: ['08:00', '12:00', '17:00'],
        5: ['10:00', '14:00'], // Weekend moins actif
        6: ['10:00', '14:00']
      },
      snapchat: {
        0: ['10:00', '15:00', '22:00'],
        1: ['10:00', '15:00', '22:00'],
        2: ['10:00', '15:00', '22:00'],
        3: ['10:00', '15:00', '22:00'],
        4: ['10:00', '15:00', '22:00'],
        5: ['11:00', '16:00', '22:00'],
        6: ['11:00', '16:00', '22:00']
      }
    };

    // Collecter tous les créneaux optimaux pour les plateformes sélectionnées
    const allTimes = new Set<string>();
    platforms.forEach(platform => {
      const times = optimalSchedule[platform]?.[dayOfWeek] || [];
      times.forEach(time => allTimes.add(time));
    });

    // Trier les heures
    return Array.from(allTimes).sort();
  };

  const saveFavoriteTimeSlot = (time: string) => {
    if (!favoriteTimeSlots.includes(time)) {
      const updated = [...favoriteTimeSlots, time];
      setFavoriteTimeSlots(updated);
      localStorage.setItem('favoriteTimeSlots', JSON.stringify(updated));
    }
  };

  const loadFavoriteTimeSlots = () => {
    const saved = localStorage.getItem('favoriteTimeSlots');
    if (saved) {
      setFavoriteTimeSlots(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadFavoriteTimeSlots();
  }, []);

  const weekDays = getWeekDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#8B6F5C] mb-2">
                📅 Calendrier de Publication
              </h1>
              <p className="text-gray-600">Glissez-déposez vos contenus directement sur le calendrier</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-6 py-3 rounded-xl font-medium transition-all shadow-md flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <Upload className="w-4 h-4" />
                Importer CSV
              </button>
              <button
                onClick={() => setShowCategoryEditor(!showCategoryEditor)}
                className={`px-6 py-3 rounded-xl font-medium transition-all shadow-md flex items-center gap-2 ${
                  showCategoryEditor
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-[#8B6F5C] text-white hover:bg-[#6d5847]'
                }`}
              >
                📋 {showCategoryEditor ? 'Fermer' : 'Personnaliser'}
              </button>
            </div>
          </div>

          {/* Category Editor */}
          {showCategoryEditor && (
            <div className="mt-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#8B6F5C] mb-1 flex items-center gap-2">
                    🎯 Configuration des catégories par jour
                  </h3>
                  <p className="text-sm text-gray-600">Choisissez quels types de contenus publier chaque jour de la semaine</p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((dayName, dayIndex) => {
                  const dayCat = dayCategories.find(dc => dc.day === dayIndex);
                  const shortName = dayName.substring(0, 3);
                  return (
                    <div key={dayIndex} className="bg-white rounded-xl p-4 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                      <p className="font-bold text-base text-center mb-3 text-[#8B6F5C] pb-2 border-b border-amber-200">
                        {shortName}
                      </p>
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Catégories :</p>
                        {categories.map(cat => (
                          <label
                            key={cat.id}
                            className="flex items-center gap-2 text-xs cursor-pointer hover:bg-amber-50 p-1.5 rounded transition-colors min-h-[28px]"
                          >
                            <input
                              type="checkbox"
                              checked={dayCat?.categories.includes(cat.id)}
                              onChange={(e) => {
                                const current = dayCat?.categories || [];
                                const updated = e.target.checked
                                  ? [...current, cat.id]
                                  : current.filter(c => c !== cat.id);
                                updateDayCategories(dayIndex, updated);
                              }}
                              className="w-3.5 h-3.5 rounded accent-[#8B6F5C] flex-shrink-0"
                            />
                            <span className="font-medium flex-shrink-0">{cat.emoji}</span>
                            <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">{cat.label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Types de contenu :</p>
                        <div className="space-y-1.5">
                          {contentTypes.map(type => (
                            <label
                              key={type.type}
                              className="flex items-center gap-2 text-xs cursor-pointer hover:bg-amber-50 p-1.5 rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={dayCat?.contentTypes?.includes(type.type) || false}
                                onChange={(e) => {
                                  const current = dayCat?.contentTypes || [];
                                  const updated = e.target.checked
                                    ? [...current, type.type]
                                    : current.filter(t => t !== type.type);
                                  updateDayContentTypes(dayIndex, updated);
                                }}
                                className="w-3.5 h-3.5 rounded accent-[#8B6F5C] flex-shrink-0"
                              />
                              <span className={`w-3 h-3 rounded ${type.color}`}></span>
                              <span className="text-xs whitespace-nowrap">{type.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Draggable items */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#8B6F5C] mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Types de contenu
          </h2>
          <div className="flex gap-4">
            {contentTypes.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  className={`${item.color} text-white px-6 py-4 rounded-xl cursor-move hover:scale-105 transition-transform shadow-md flex items-center gap-3`}
                >
                  <Icon className="w-6 h-6" />
                  <div>
                    <p className="font-bold">{item.label}</p>
                    <p className="text-xs opacity-90">Glisser sur le calendrier</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Week navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-4 mb-6 flex items-center justify-between">
          <button
            onClick={previousWeek}
            className="px-4 py-2 bg-[#8B6F5C] text-white rounded-lg hover:bg-[#6d5847] transition-colors"
          >
            ← Précédent
          </button>
          <h2 className="text-xl font-bold text-[#8B6F5C]">
            Semaine du {formatDate(weekDays[0])} au {formatDate(weekDays[6])}
          </h2>
          <button
            onClick={nextWeek}
            className="px-4 py-2 bg-[#8B6F5C] text-white rounded-lg hover:bg-[#6d5847] transition-colors"
          >
            Suivant →
          </button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayPosts = getPostsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const dayCat = getCategoriesForDay(day);

            return (
              <div
                key={index}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(day)}
                className={`bg-white rounded-2xl p-4 border-2 min-h-[350px] transition-all ${
                  isToday
                    ? 'border-[#8B6F5C] shadow-lg'
                    : `${dayCat.color} hover:border-amber-400 hover:shadow-md`
                }`}
              >
                <div className={`text-center mb-3 pb-3 border-b ${isToday ? 'bg-gradient-to-r from-amber-100 to-orange-100 -mx-4 px-4 py-2 -mt-4 mb-4 rounded-t-2xl border-b-2 border-amber-300' : 'border-amber-100'}`}>
                  <p className={`text-sm font-bold uppercase ${isToday ? 'text-[#8B6F5C]' : 'text-gray-500'}`}>
                    {day.toLocaleDateString('fr-FR', { weekday: 'long' })}
                  </p>
                  <p className={`text-3xl font-bold ${isToday ? 'text-[#8B6F5C]' : 'text-gray-800'}`}>
                    {day.getDate()}
                  </p>
                  {isToday && (
                    <p className="text-xs text-[#8B6F5C] font-semibold mt-1">
                      🎯 Aujourd'hui
                    </p>
                  )}
                </div>

                {/* Day Content Types and Categories */}
                <div className="mb-3 space-y-2">
                  {/* Suggested Content Types */}
                  {dayCat.contentTypes && dayCat.contentTypes.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 text-center font-medium mb-1.5">Types suggérés :</p>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {dayCat.contentTypes.map(type => {
                          const typeInfo = contentTypes.find(t => t.type === type);
                          return typeInfo ? (
                            <span
                              key={type}
                              className={`text-xs px-2.5 py-1 rounded-lg ${typeInfo.color} text-white font-medium shadow-sm flex items-center gap-1`}
                              title={typeInfo.label}
                            >
                              {typeInfo.type === 'post' && '📄'}
                              {typeInfo.type === 'reel' && '🎬'}
                              {typeInfo.type === 'story' && '📸'}
                              {typeInfo.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Suggested Categories */}
                  {dayCat.categories.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 text-center font-medium mb-1.5">Catégories :</p>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {dayCat.categories.map(catId => {
                          const cat = categories.find(c => c.id === catId);
                          return cat ? (
                            <span
                              key={catId}
                              className={`text-xs px-2.5 py-1.5 rounded-lg ${cat.color} font-medium shadow-sm`}
                              title={cat.label}
                            >
                              {cat.emoji} {cat.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {dayPosts.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">
                      Déposez ici
                    </p>
                  )}
                  {dayPosts.map((post) => {
                    const contentTypeColor =
                      post.contentType === 'post' ? 'bg-blue-50 border-blue-200' :
                      post.contentType === 'reel' ? 'bg-purple-50 border-purple-200' :
                      'bg-pink-50 border-pink-200';

                    const statusConfig = {
                      draft: {
                        emoji: '📝',
                        label: 'Brouillon',
                        badgeColor: 'bg-gray-200 text-gray-800 border border-gray-400',
                        borderColor: 'border-l-4 border-l-gray-500'
                      },
                      scheduled: {
                        emoji: '📅',
                        label: 'Planifié',
                        badgeColor: 'bg-amber-200 text-amber-900 border border-amber-400',
                        borderColor: 'border-l-4 border-l-amber-600'
                      },
                      published: {
                        emoji: '✅',
                        label: 'Publié',
                        badgeColor: 'bg-green-200 text-green-900 border border-green-400',
                        borderColor: 'border-l-4 border-l-green-600'
                      }
                    };

                    const status = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.draft;

                    return (
                      <div
                        key={post.id}
                        onClick={() => setEditingPost(post)}
                        className={`${contentTypeColor} border rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all ${status.borderColor}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-bold text-gray-700">
                            {formatTime(new Date(post.scheduledDate))}
                          </p>
                          <div className="flex gap-1">
                            <span className={`text-xs px-2 py-1 rounded-lg font-bold shadow-sm ${status.badgeColor}`}>
                              {status.emoji} {status.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-800 font-medium truncate mb-2">
                          {post.title}
                        </p>

                        {/* Media Preview */}
                        {post.mediaUrls && (() => {
                          try {
                            const mediaArray = JSON.parse(post.mediaUrls);
                            if (mediaArray.length > 0) {
                              return (
                                <div className="mb-2 relative">
                                  <img
                                    src={mediaArray[0]}
                                    alt="Preview"
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                  {mediaArray.length > 1 && (
                                    <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                      +{mediaArray.length - 1}
                                    </span>
                                  )}
                                </div>
                              );
                            }
                          } catch (e) {
                            return null;
                          }
                        })()}

                        <div className="flex flex-wrap gap-1">
                          {post.platform?.split(',').map((p) => (
                            <span
                              key={p}
                              className="text-xs px-2 py-1 bg-white rounded text-gray-600 flex items-center gap-1"
                            >
                              {p === 'instagram' && <FaInstagram className="w-3 h-3" />}
                              {p === 'facebook' && <FaFacebook className="w-3 h-3" />}
                              {p === 'tiktok' && <FaTiktok className="w-3 h-3" />}
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Post Modal */}
      {showModal && modalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#8B6F5C]">
                Créer un {modalData.contentType === 'post' ? 'Post' : modalData.contentType === 'reel' ? 'Reel' : 'Story'}
              </h2>
              <p className="text-gray-600 mt-1">
                Pour le {modalData.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>

              {/* Suggested categories for the day */}
              {(() => {
                const dayCat = getCategoriesForDay(modalData.date);
                return dayCat.categories.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-gray-600 mb-2">Catégories suggérées pour ce jour :</p>
                    <div className="flex flex-wrap gap-2">
                      {dayCat.categories.map(catId => {
                        const cat = categories.find(c => c.id === catId);
                        return cat ? (
                          <span key={catId} className={`text-sm px-3 py-1 rounded-full ${cat.color} font-medium`}>
                            {cat.emoji} {cat.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const saveAsDraft = (e.nativeEvent as any).submitter?.name === 'draft';
                handleCreatePost({
                  title: formData.get('title'),
                  content: formData.get('content'),
                  platform: Array.from(formData.getAll('platforms')).join(','),
                  category: formData.get('category'),
                  scheduledTime: formData.get('time'),
                  saveAsDraft: saveAsDraft
                });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  required
                  onChange={(e) => {
                    if (modalData) {
                      const suggestions = generateContentSuggestions(modalData.contentType, e.target.value);
                      setContentSuggestions(suggestions);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C] focus:border-transparent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Suggestions */}
              {contentSuggestions.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="text-sm font-semibold text-[#8B6F5C] mb-2 flex items-center gap-2">
                    💡 Idées de contenu pour vous inspirer
                  </h4>
                  <div className="space-y-2">
                    {contentSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const titleInput = document.querySelector<HTMLInputElement>('input[name="title"]');
                          const contentInput = document.querySelector<HTMLTextAreaElement>('textarea[name="content"]');
                          if (titleInput) titleInput.value = suggestion.title;
                          if (contentInput) contentInput.value = suggestion.content;
                        }}
                        className="bg-white p-3 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors border border-amber-100"
                      >
                        <p className="text-sm font-semibold text-gray-900">{suggestion.title}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{suggestion.content}</p>
                        <p className="text-xs text-amber-600 mt-1 font-medium">{suggestion.trending}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C] focus:border-transparent"
                  placeholder="Titre de votre publication"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu *
                </label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C] focus:border-transparent"
                  placeholder="Rédigez votre contenu..."
                />
              </div>

              {/* Media Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Médias (images/vidéos)
                </label>
                <div className="space-y-3">
                  {/* Upload button */}
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#8B6F5C] hover:bg-amber-50 transition-colors">
                        <Image className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {isUploading ? 'Upload en cours...' : 'Ajouter une image/vidéo'}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska,video/avi,video/x-flv,video/mpeg,video/3gpp,video/x-ms-wmv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMediaUpload(file);
                        }}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {/* Preview uploaded media */}
                  {uploadedMedia.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {uploadedMedia.map((media, idx) => (
                        <div key={idx} className="relative group">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              controls
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(media.publicId)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {media.type === 'video' ? '🎬' : '📸'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    📸 Images: JPG, PNG, GIF, WEBP (max 10MB)<br/>
                    🎬 Vidéos: MP4, MOV, AVI, WebM, MKV, FLV, MPEG, 3GP, WMV (max 50MB)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plateformes *
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="platforms"
                      value="instagram"
                      className="w-4 h-4"
                      onChange={(e) => {
                        const selected = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="platforms"]:checked'))
                          .map(el => el.value);
                        setSelectedPlatforms(selected);
                      }}
                    />
                    <FaInstagram className="text-pink-600" />
                    <span>Instagram</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="platforms"
                      value="facebook"
                      className="w-4 h-4"
                      onChange={(e) => {
                        const selected = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="platforms"]:checked'))
                          .map(el => el.value);
                        setSelectedPlatforms(selected);
                      }}
                    />
                    <FaFacebook className="text-blue-600" />
                    <span>Facebook</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="platforms"
                      value="tiktok"
                      className="w-4 h-4"
                      onChange={(e) => {
                        const selected = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="platforms"]:checked'))
                          .map(el => el.value);
                        setSelectedPlatforms(selected);
                      }}
                    />
                    <FaTiktok className="text-gray-900" />
                    <span>TikTok</span>
                  </label>
                </div>
              </div>

              {/* Optimal Posting Times */}
              {selectedPlatforms.length > 0 && modalData && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-[#8B6F5C] mb-3 flex items-center gap-2">
                    ⏰ Meilleures heures pour poster
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {getOptimalPostingTimes(selectedPlatforms, getDayOfWeek(modalData.date)).map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          const timeInput = document.querySelector<HTMLInputElement>('input[name="time"]');
                          if (timeInput) timeInput.value = time;
                        }}
                        className="px-3 py-2 bg-white border border-green-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-100 hover:border-green-400 transition-colors"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    ⭐ Basé sur les pics d'engagement pour {selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                  </p>
                </div>
              )}

              {/* Favorite Time Slots */}
              {favoriteTimeSlots.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="text-sm font-semibold text-[#8B6F5C] mb-3 flex items-center gap-2">
                    💫 Vos créneaux favoris
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {favoriteTimeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          const timeInput = document.querySelector<HTMLInputElement>('input[name="time"]');
                          if (timeInput) timeInput.value = time;
                        }}
                        className="px-3 py-2 bg-[#8B6F5C] text-white rounded-lg text-sm font-medium hover:bg-[#6d5847] transition-colors"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>Heure de publication *</span>
                  <button
                    type="button"
                    onClick={() => {
                      const timeInput = document.querySelector<HTMLInputElement>('input[name="time"]');
                      if (timeInput && timeInput.value) {
                        saveFavoriteTimeSlot(timeInput.value);
                      }
                    }}
                    className="text-xs text-[#8B6F5C] hover:underline"
                  >
                    ⭐ Sauvegarder comme favori
                  </button>
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C] focus:border-transparent"
                />
              </div>

              {/* Advanced Options Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-sm text-[#8B6F5C] hover:text-[#6d5847] font-medium flex items-center gap-2"
                >
                  {showAdvancedOptions ? '▼' : '▶'} Options avancées (notes, liens, hashtags)
                </button>
              </div>

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💭 Notes & Idées
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Ajoutez vos notes, idées, ou rappels pour ce contenu..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ex: Penser à mentionner le nouveau produit, utiliser la photo du 15/03
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔗 Liens de référence
                    </label>
                    <textarea
                      name="links"
                      rows={3}
                      placeholder="Un lien par ligne&#10;https://exemple.com/inspiration&#10;https://exemple.com/produit"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ajoutez des liens utiles : inspirations, produits, articles...
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      # Hashtags
                    </label>
                    <input
                      type="text"
                      name="hashtags"
                      placeholder="#laiaskin #beaute #skincare #bienetre"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Préparez vos hashtags à l'avance
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setModalData(null);
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  name="draft"
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  💾 Enregistrer en brouillon
                </button>
                <button
                  type="submit"
                  name="schedule"
                  className="flex-1 px-4 py-3 bg-[#8B6F5C] text-white rounded-lg hover:bg-[#6d5847] transition-colors font-medium"
                >
                  📅 Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#8B6F5C]">
                Modifier : {editingPost.title}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  editingPost.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                  editingPost.status === 'scheduled' ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {editingPost.status === 'draft' ? '📝 Brouillon' :
                   editingPost.status === 'scheduled' ? '📅 Planifié' :
                   '✅ Publié'}
                </span>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const saveAsDraft = (e.nativeEvent as any).submitter?.name === 'draft';

                const scheduledDate = new Date(editingPost.scheduledDate);
                const timeValue = formData.get('time') as string;
                if (timeValue) {
                  const [hours, minutes] = timeValue.split(':');
                  scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                }

                const linksValue = formData.get('links') as string;
                let linksArray: string[] = [];
                if (linksValue) {
                  linksArray = linksValue.split('\n').filter(link => link.trim());
                }

                const token = localStorage.getItem('token');
                const response = await fetch(`/api/admin/social-media/${editingPost.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    title: formData.get('title'),
                    content: formData.get('content'),
                    platform: Array.from(formData.getAll('platforms')).join(','),
                    category: formData.get('category'),
                    scheduledDate: scheduledDate.toISOString(),
                    status: saveAsDraft ? 'draft' : 'scheduled',
                    notes: formData.get('notes') || null,
                    links: linksArray.length > 0 ? JSON.stringify(linksArray) : null,
                    hashtags: formData.get('hashtags') || null
                  })
                });

                if (response.ok) {
                  await loadPosts();
                  setEditingPost(null);
                  setShowAdvancedOptions(false);
                }
              }}
              className="p-6 space-y-4"
            >
              {/* Notes si existantes */}
              {(editingPost as any).notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-[#8B6F5C] mb-2">💭 Notes sauvegardées</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{(editingPost as any).notes}</p>
                </div>
              )}

              {/* Links si existants */}
              {(editingPost as any).links && JSON.parse((editingPost as any).links).length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-[#8B6F5C] mb-2">🔗 Liens de référence</h4>
                  <div className="space-y-1">
                    {JSON.parse((editingPost as any).links).map((link: string, idx: number) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingPost.title}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenu *</label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  defaultValue={editingPost.content}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <select
                  name="category"
                  required
                  defaultValue={editingPost.category || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C]"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plateformes *</label>
                <div className="flex flex-wrap gap-4">
                  {['instagram', 'facebook', 'tiktok'].map(p => (
                    <label key={p} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="platforms"
                        value={p}
                        defaultChecked={editingPost.platform?.includes(p)}
                        className="w-4 h-4"
                      />
                      <span className="capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure *</label>
                <input
                  type="time"
                  name="time"
                  required
                  defaultValue={new Date(editingPost.scheduledDate).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C]"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-sm text-[#8B6F5C] hover:text-[#6d5847] font-medium flex items-center gap-2"
                >
                  {showAdvancedOptions ? '▼' : '▶'} Options avancées
                </button>
              </div>

              {showAdvancedOptions && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">💭 Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={(editingPost as any).notes || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🔗 Liens</label>
                    <textarea
                      name="links"
                      rows={3}
                      defaultValue={(editingPost as any).links ? JSON.parse((editingPost as any).links).join('\n') : ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"># Hashtags</label>
                    <input
                      type="text"
                      name="hashtags"
                      defaultValue={(editingPost as any).hashtags || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPost(null);
                    setShowAdvancedOptions(false);
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                {editingPost.status === 'draft' && (
                  <button
                    type="submit"
                    name="draft"
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                  >
                    💾 Sauvegarder le brouillon
                  </button>
                )}
                <button
                  type="submit"
                  name="schedule"
                  className="flex-1 px-4 py-3 bg-[#8B6F5C] text-white rounded-lg hover:bg-[#6d5847] font-medium"
                >
                  {editingPost.status === 'draft' ? '📅 Planifier maintenant' : '✅ Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-[#8B6F5C] mb-4">
              📤 Importer un calendrier CSV
            </h2>

            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#8B6F5C] mb-2">📋 Format du CSV</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Votre fichier CSV doit contenir les colonnes suivantes :
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>date</strong> : format JJ/MM/AAAA (ex: 25/12/2025)</li>
                  <li><strong>heure</strong> : format HH:MM (ex: 14:30)</li>
                  <li><strong>type</strong> : post, reel ou story</li>
                  <li><strong>titre</strong> : titre de votre publication</li>
                  <li><strong>contenu</strong> : texte de votre publication</li>
                  <li><strong>plateformes</strong> : instagram, facebook, tiktok (séparés par des virgules)</li>
                  <li><strong>categorie</strong> : prestations, conseils, avant-apres, etc.</li>
                  <li><strong>hashtags</strong> : vos hashtags (optionnel)</li>
                </ul>
              </div>

              {/* Download Template Button */}
              <button
                onClick={downloadCSVTemplate}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger le modèle CSV
              </button>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner votre fichier CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportCSV(file);
                  }}
                  disabled={isImporting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6F5C] focus:border-transparent"
                />
              </div>

              {isImporting && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B6F5C]"></div>
                  <p className="mt-2 text-gray-600">Import en cours...</p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowImportModal(false)}
                disabled={isImporting}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
