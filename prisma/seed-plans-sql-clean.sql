-- Seed SQL pour les 4 formules LAIA Connect (sans accents)
-- A executer dans Supabase SQL Editor

-- Nettoyer les anciennes donnees
TRUNCATE TABLE "SubscriptionPlan";

-- Inserer SOLO
INSERT INTO "SubscriptionPlan" (
  "id", "planKey", "name", "displayName", "description",
  "priceMonthly", "priceYearly", "maxLocations", "maxUsers", "maxStorage",
  "features", "highlights",
  "isPopular", "isRecommended", "displayOrder", "isActive", "updatedAt"
) VALUES (
  'plan_solo_001',
  'SOLO',
  'Solo',
  'Formule Solo',
  'Parfait pour un institut independant avec 1 emplacement',
  49,
  588,
  1, 1, 5,
  '["featureGiftCards","featureLeads","featureLoyalty","featureEmailing","featureWhatsApp","featureAccounting","featureInvoices","featureReviews","featureStripe","featureCustomDesign"]',
  '["Reservations en ligne illimitees","Planning intelligent","Cartes cadeaux","Programme de fidelite basique","Paiements en ligne (Stripe)","Site web personnalisable","Support email standard"]',
  false, false, 1, true, CURRENT_TIMESTAMP
);

-- Inserer DUO
INSERT INTO "SubscriptionPlan" (
  "id", "planKey", "name", "displayName", "description",
  "priceMonthly", "priceYearly", "maxLocations", "maxUsers", "maxStorage",
  "features", "highlights",
  "isPopular", "isRecommended", "displayOrder", "isActive", "updatedAt"
) VALUES (
  'plan_duo_001',
  'DUO',
  'Duo',
  'Formule Duo',
  'Pour un institut en croissance avec une petite equipe (3 utilisateurs)',
  69,
  828,
  1, 3, 10,
  '["featureBlog","featureGiftCards","featureCRM","featureLeads","featureLoyalty","featureLoyaltyAdvanced","featureReferral","featureEmailing","featureEmailAutomation","featureWhatsApp","featureMultiUser","featureRoles","featureAccounting","featureInvoices","featureExports","featureReviews","featureReviewsAdvanced","featureStripe","featurePaymentTracking","featureCustomDesign","featureSEO","featureOnboarding"]',
  '["Tout de SOLO +","CRM complet (leads, prospects, clients)","Blog / Actualites pour le SEO","Fidelite avancee (paliers VIP, points)","Programme de parrainage","Emails automation","3 utilisateurs avec roles","Photos avant/apres clients","Export donnees (CSV)","Outils SEO","Onboarding guide personnalise"]',
  true, false, 2, true, CURRENT_TIMESTAMP
);

-- Inserer TEAM
INSERT INTO "SubscriptionPlan" (
  "id", "planKey", "name", "displayName", "description",
  "priceMonthly", "priceYearly", "maxLocations", "maxUsers", "maxStorage",
  "features", "highlights",
  "isPopular", "isRecommended", "displayOrder", "isActive", "updatedAt"
) VALUES (
  'plan_team_001',
  'TEAM',
  'Team',
  'Formule Team',
  'Pour les instituts etablis avec plusieurs emplacements (3 max)',
  119,
  1428,
  3, 10, 25,
  '["featureBlog","featureProducts","featureOrders","featureGiftCards","featureCRM","featureLeads","featureClientSegmentation","featureLoyalty","featureLoyaltyAdvanced","featureReferral","featureEmailing","featureEmailAutomation","featureWhatsApp","featureWhatsAppAutomation","featureSMS","featureSocialMedia","featureSocialSchedule","featureInstagram","featureFacebook","featureMultiLocation","featureMultiUser","featureRoles","featureAccounting","featureInvoices","featureExports","featureReports","featureReviews","featureReviewsAdvanced","featureGoogleReviews","featureStripe","featurePaymentTracking","featureRefunds","featureCustomDomain","featureCustomDesign","featureCustomEmails","featureSEO","featurePrioritySupport","featureOnboarding"]',
  '["Tout de DUO +","Boutique produits en ligne","Segmentation clients avancee","WhatsApp & SMS automation","Publications Instagram & Facebook","Sync avis Google Reviews","3 emplacements","10 utilisateurs","Rapports statistiques avances","Domaine personnalise inclus","Gestion des remboursements","Support prioritaire (reponse <4h)"]',
  false, true, 3, true, CURRENT_TIMESTAMP
);

-- Inserer PREMIUM
INSERT INTO "SubscriptionPlan" (
  "id", "planKey", "name", "displayName", "description",
  "priceMonthly", "priceYearly", "maxLocations", "maxUsers", "maxStorage",
  "features", "highlights",
  "isPopular", "isRecommended", "displayOrder", "isActive", "updatedAt"
) VALUES (
  'plan_premium_001',
  'PREMIUM',
  'Premium',
  'Formule Premium',
  'Pour les chaines et franchises, tout illimite',
  179,
  2148,
  999, 999, 100,
  '["featureBlog","featureProducts","featureFormations","featureOrders","featureGiftCards","featureCRM","featureLeads","featureClientSegmentation","featureLoyalty","featureLoyaltyAdvanced","featureReferral","featureEmailing","featureEmailAutomation","featureWhatsApp","featureWhatsAppAutomation","featureSMS","featureSocialMedia","featureSocialSchedule","featureInstagram","featureFacebook","featureTikTok","featureStock","featureStockAlerts","featureMultiLocation","featureMultiUser","featureRoles","featureAccounting","featureInvoices","featureExports","featureReports","featureReviews","featureReviewsAdvanced","featureGoogleReviews","featureStripe","featurePaymentTracking","featureRefunds","featureCustomDomain","featureCustomDesign","featureCustomEmails","featureSEO","featurePrioritySupport","featureOnboarding","featureDedicatedAccount"]',
  '["Tout de TEAM +","Vente de formations en ligne","TikTok integration","Gestion de stock complete","Alertes stock bas automatiques","Emplacements illimites","Utilisateurs illimites","100 GB de stockage","Account manager dedie","Formation equipe incluse","API personnalisee disponible"]',
  false, false, 4, true, CURRENT_TIMESTAMP
);

-- Verifier l'insertion
SELECT "planKey", "name", "priceMonthly", "isActive" FROM "SubscriptionPlan" ORDER BY "displayOrder";
