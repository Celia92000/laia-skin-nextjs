'use client';

/**
 * EXAMPLE USAGE OF FAQSection Component
 *
 * This file demonstrates how to use the FAQSection component
 * in your beauty institute templates.
 */

import FAQSection from './FAQSection';

export default function FAQSectionExample() {
  // Example data - Replace with real data from your database
  const faqList = [
    {
      id: '1',
      question: 'Combien de temps dure une séance de soin ?',
      answer: 'La durée d\'une séance varie selon le traitement choisi. Un soin visage classique dure généralement entre 60 et 90 minutes, tandis qu\'un traitement spécifique comme le microneedling peut prendre de 45 à 60 minutes. Nous vous informons toujours de la durée exacte lors de votre réservation.',
      category: 'Général'
    },
    {
      id: '2',
      question: 'Dois-je prendre rendez-vous à l\'avance ?',
      answer: 'Oui, nous travaillons uniquement sur rendez-vous pour garantir une attention personnalisée et un service de qualité. Nous vous recommandons de réserver au moins 48h à l\'avance, surtout pour les week-ends et les créneaux en soirée.',
      category: 'Réservation'
    },
    {
      id: '3',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les paiements en espèces, par carte bancaire (Visa, Mastercard, American Express), et par virement bancaire. Pour votre confort, le paiement se fait à la fin de votre séance. Nous proposons également des forfaits avec paiement en plusieurs fois.',
      category: 'Paiement'
    },
    {
      id: '4',
      question: 'À partir de quel âge peut-on commencer les soins anti-âge ?',
      answer: 'Il n\'y a pas d\'âge minimum pour commencer à prendre soin de sa peau. Cependant, les soins anti-âge préventifs sont généralement recommandés à partir de 25-30 ans. Nos esthéticiennes vous conseilleront les soins adaptés à votre âge et votre type de peau lors d\'un diagnostic personnalisé.',
      category: 'Soins'
    },
    {
      id: '5',
      question: 'Vos produits sont-ils naturels et bio ?',
      answer: 'Nous utilisons une sélection rigoureuse de produits professionnels, dont une majorité est certifiée bio et naturelle. Tous nos produits sont dermatologiquement testés, sans parabènes, et respectueux de l\'environnement. Nous pouvons vous fournir la liste complète des ingrédients sur demande.',
      category: 'Produits'
    },
    {
      id: '6',
      question: 'Puis-je annuler ou modifier mon rendez-vous ?',
      answer: 'Oui, vous pouvez annuler ou modifier votre rendez-vous jusqu\'à 24h avant l\'heure prévue sans frais. Les annulations tardives (moins de 24h) peuvent entraîner des frais d\'annulation de 50% du montant du soin. Pour modifier votre rendez-vous, contactez-nous par téléphone ou via notre espace client en ligne.',
      category: 'Réservation'
    },
    {
      id: '7',
      question: 'Proposez-vous des forfaits ou des cartes cadeaux ?',
      answer: 'Oui, nous proposons plusieurs formules : des forfaits de soins à prix avantageux, des abonnements mensuels, et des cartes cadeaux d\'une validité de 1 an. Nos forfaits permettent une économie jusqu\'à 20% par rapport aux tarifs unitaires. Contactez-nous pour plus d\'informations.',
      category: 'Tarifs'
    },
    {
      id: '8',
      question: 'Les soins sont-ils douloureux ?',
      answer: 'La plupart de nos soins sont relaxants et non douloureux. Certains traitements comme le microneedling ou la radiofréquence peuvent occasionner une légère sensation d\'inconfort, mais nous adaptons toujours l\'intensité à votre seuil de tolérance. Votre confort est notre priorité.',
      category: 'Soins'
    },
    {
      id: '9',
      question: 'Combien de séances sont nécessaires pour voir des résultats ?',
      answer: 'Cela dépend du type de soin et de votre objectif. Certains soins comme l\'hydrafacial offrent des résultats visibles immédiatement. Pour des traitements anti-âge ou anti-taches, nous recommandons généralement une cure de 6 à 10 séances espacées de 2 à 4 semaines. Un programme personnalisé vous sera proposé lors de votre première consultation.',
      category: 'Résultats'
    },
    {
      id: '10',
      question: 'Y a-t-il des contre-indications aux soins ?',
      answer: 'Certains soins peuvent être contre-indiqués en cas de grossesse, d\'allaitement, de maladies de peau actives (eczéma, psoriasis en poussée), ou de traitements médicaux spécifiques. Nous vous demandons de remplir un questionnaire santé avant tout premier soin. En cas de doute, nous vous recommandons de consulter votre médecin.',
      category: 'Santé'
    },
    {
      id: '11',
      question: 'Offrez-vous une consultation gratuite ?',
      answer: 'Oui, nous offrons une consultation-diagnostic de peau gratuite de 15 minutes lors de votre première visite. Cette consultation nous permet de comprendre vos besoins, d\'analyser votre peau, et de vous recommander les soins les plus adaptés. Aucun engagement n\'est requis.',
      category: 'Général'
    },
    {
      id: '12',
      question: 'Quelle est votre politique de confidentialité ?',
      answer: 'Toutes vos informations personnelles et médicales sont strictement confidentielles et stockées de manière sécurisée conformément au RGPD. Elles ne sont jamais partagées avec des tiers. Vous pouvez demander la consultation, la modification ou la suppression de vos données à tout moment.',
      category: 'Confidentialité'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Example 1: Default behavior (single open, with search and categories) */}
      <FAQSection
        title="Questions Fréquentes"
        description="Tout ce que vous devez savoir sur nos services et nos soins"
        faqs={faqList}
        primaryColor="#D4A574"
        allowMultipleOpen={false}
      />

      {/* Example 2: Allow multiple open (uncomment to test) */}
      {/*
      <FAQSection
        title="FAQ - Mode Multiple"
        description="Vous pouvez ouvrir plusieurs questions en même temps"
        faqs={faqList}
        primaryColor="#8B5CF6"
        allowMultipleOpen={true}
      />
      */}

      {/* Example 3: Simple FAQ without categories (uncomment to test) */}
      {/*
      <FAQSection
        title="Questions Simples"
        description="FAQ sans catégories"
        faqs={faqList.map(faq => ({ ...faq, category: undefined }))}
        primaryColor="#10B981"
      />
      */}
    </div>
  );
}

/**
 * HOW IT WORKS:
 *
 * 1. Accordion Behavior:
 *    - Click question to expand/collapse answer
 *    - By default, only one question can be open at a time
 *    - Set allowMultipleOpen={true} to allow multiple open
 *
 * 2. Smart Features (Auto-enabled):
 *    - Search bar: Appears when you have more than 8 FAQs
 *    - Category tabs: Appears if any FAQ has a category
 *    - Both features work together seamlessly
 *
 * 3. Accessibility:
 *    - Keyboard navigation (Tab, Enter, Space)
 *    - ARIA attributes for screen readers
 *    - Focus management
 *
 * CUSTOMIZATION:
 *
 * - title: Change the section title
 * - description: Change the section description
 * - primaryColor: Your brand's primary color (hex or rgb)
 * - allowMultipleOpen: true to allow multiple FAQs open simultaneously
 * - faqs: Array of questions with optional categories
 *
 * SEARCH FEATURE:
 * - Automatically appears when you have >8 FAQs
 * - Searches through both questions and answers
 * - Shows "no results" message with reset button
 * - Case-insensitive search
 *
 * CATEGORY FEATURE:
 * - Automatically appears if any FAQ has a category
 * - Filter FAQs by clicking category tabs
 * - "Tout" tab to show all FAQs
 * - Works together with search
 *
 * ANIMATION:
 * - Smooth height transitions (300ms)
 * - Icon rotates from + to - when opening
 * - Button background changes color
 * - Border highlights active question
 */
