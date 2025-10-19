// Configuration des informations légales de l'entreprise
// DÉPRÉCIÉ : Utilisez plutôt la table SiteConfig en BDD
// import { getSiteConfig } from '@/lib/config-service';

export const companyInfo = {
  // Informations de base
  name: "Mon Institut de Beauté",
  legalName: "Mon Institut SARL", // Raison sociale
  address: {
    street: "1 Rue de l'Institut",
    zipCode: "75000",
    city: "Paris",
    country: "France"
  },

  // Contact
  phone: "01 00 00 00 00",
  email: "contact@mon-institut.fr",
  website: "www.mon-institut.fr",
  
  // Informations légales
  siret: "123 456 789 00012", // À remplacer par le vrai SIRET
  siren: "123 456 789", // 9 premiers chiffres du SIRET
  tva: "FR 12 123456789", // N° TVA intracommunautaire
  ape: "9602B", // Code APE/NAF pour les soins de beauté
  rcs: "Paris 123 456 789", // RCS + ville + n° SIREN
  
  // Capital social
  capital: "10 000 €", // Capital social de l'entreprise
  legalForm: "SARL", // Forme juridique (SARL, SAS, EURL, etc.)
  
  // Assurances
  insurance: {
    company: "AXA France",
    contractNumber: "1234567",
    type: "RC Professionnelle"
  },
  
  // Représentant légal
  legalRepresentative: {
    name: "Laïa [Nom]", // Nom du gérant
    title: "Gérante" // Titre (Gérant, Président, etc.)
  },
  
  // Informations bancaires (pour les virements)
  bank: {
    name: "BNP Paribas",
    iban: "FR76 1234 5678 9012 3456 7890 123", // À remplacer
    bic: "BNPAFRPPXXX" // À remplacer
  },
  
  // Conditions commerciales
  payment: {
    terms: "Paiement comptant à réception",
    latePenaltyRate: "Taux d'intérêt légal majoré de 10 points",
    recoveryIndemnity: "40 €", // Indemnité forfaitaire de recouvrement
    earlyDiscount: "Aucun" // Escompte pour paiement anticipé
  },
  
  // Régime TVA
  vat: {
    regime: "franchise", // "franchise" ou "normal"
    rate: 20, // Taux de TVA en %
    franchiseText: "TVA non applicable, art. 293 B du CGI",
    normalText: "TVA sur les encaissements"
  },
  
  // Juridiction
  jurisdiction: "Tribunaux de Paris",
  
  // Mentions légales spécifiques
  specificMentions: [
    "Conformément à la loi n° 92-1442 du 31 décembre 1992, les produits cosmétiques ne sont ni repris ni échangés.",
    "Les soins sont personnalisés et non remboursables sauf cas de force majeure."
  ]
};

// Fonction pour formater l'adresse complète
export const getFullAddress = () => {
  const { street, zipCode, city, country } = companyInfo.address;
  return `${street}, ${zipCode} ${city}, ${country}`;
};

// Fonction pour obtenir le texte TVA selon le montant
export const getVATText = (amount: number) => {
  if (companyInfo.vat.regime === 'franchise' && amount < 150) {
    return companyInfo.vat.franchiseText;
  }
  return companyInfo.vat.normalText;
};

// Fonction pour calculer la TVA
export const calculateVAT = (amountTTC: number) => {
  const rate = companyInfo.vat.rate / 100;
  const amountHT = amountTTC / (1 + rate);
  const vat = amountTTC - amountHT;
  return {
    ht: amountHT,
    vat: vat,
    ttc: amountTTC,
    rate: companyInfo.vat.rate
  };
};