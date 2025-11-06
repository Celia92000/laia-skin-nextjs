"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, FileText, Plus, Trash2, Eye, EyeOff, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'

interface ContractClause {
  id?: string
  key: string
  title: string
  content: string
  order: number
  isDefault: boolean
  isActive: boolean
}

const DEFAULT_CLAUSES: Omit<ContractClause, 'id'>[] = [
  {
    key: 'article_1',
    title: 'ARTICLE 1 - OBJET DU CONTRAT',
    content: 'Le présent contrat a pour objet de définir les conditions dans lesquelles LAIA Connect (ci-après "le Prestataire") met à disposition du Client sa solution logicielle SaaS (Software as a Service) dédiée à la gestion complète d\'instituts de beauté et centres esthétiques.\n\nLa solution LAIA Connect comprend notamment :\n• Un site web personnalisable avec nom de domaine dédié\n• Un système de réservation en ligne avec gestion automatisée des rendez-vous\n• Un CRM client pour la gestion et la fidélisation de la clientèle\n• Un module de vente (prestations, produits, cartes cadeaux)\n• Un espace client personnel pour chaque client de l\'institut\n• Des outils de communication (emails automatiques, newsletters)\n• Un tableau de bord analytique avec statistiques et rapports\n• La gestion multi-emplacements selon la formule souscrite\n• Le support technique et les mises à jour régulières du logiciel',
    order: 1,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_2',
    title: 'ARTICLE 2 - FORMULE SOUSCRITE',
    content: 'Le Client souscrit à la formule {plan} de LAIA Connect.\n\n**Tarification**\n• Prix mensuel : {monthlyAmount}€ HT ({monthlyAmountTTC}€ TTC)\n• Mode de paiement : Prélèvement SEPA automatique mensuel\n• Facturation : À terme échu (en fin de mois)\n\nLe Client pourra à tout moment modifier sa formule d\'abonnement. En cas de changement, les nouvelles conditions tarifaires s\'appliqueront dès le début du mois suivant la demande.',
    order: 2,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_3',
    title: 'ARTICLE 3 - PÉRIODE D\'ESSAI GRATUITE',
    content: 'Le Client bénéficie d\'une période d\'essai gratuite de 30 jours à compter de la date d\'activation de son compte, lui permettant de tester l\'intégralité des fonctionnalités de la formule souscrite.\n\n**Modalités de la période d\'essai**\n• Durée : 30 jours calendaires\n• Accès complet : Toutes les fonctionnalités de la formule sont accessibles\n• Aucun engagement : Le Client peut résilier à tout moment pendant l\'essai\n• Aucun paiement pendant la période d\'essai\n\n**Fin de la période d\'essai**\nÀ l\'issue de la période d\'essai, si le Client n\'a pas résilié, le premier prélèvement interviendra automatiquement le {trialEndsAt}.',
    order: 3,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_4',
    title: 'ARTICLE 4 - DURÉE ET RÉSILIATION',
    content: '**4.1 Durée du contrat**\nLe présent contrat est conclu pour une durée indéterminée. Il prend effet à compter de la date de signature électronique et se poursuit par tacite reconduction mensuellement. L\'abonnement est sans engagement de durée.\n\n**4.2 Résiliation par le Client**\nLe Client peut résilier son abonnement à tout moment en respectant un préavis de 30 jours :\n• Par email à : contact@laia-connect.fr\n• Depuis son espace client : "Mon abonnement" > "Résilier"\n• Par courrier recommandé avec accusé de réception\n\nLa résiliation prend effet à la fin du mois en cours. Le Client dispose de 30 jours pour exporter ses données après la résiliation.\n\n**4.3 Suspension pour défaut de paiement**\nEn cas de défaut de paiement, le Prestataire peut suspendre l\'accès au service après mise en demeure restée sans effet pendant 15 jours.',
    order: 4,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_5',
    title: 'ARTICLE 5 - MANDAT DE PRÉLÈVEMENT SEPA',
    content: 'Le Client autorise LAIA Connect à effectuer des prélèvements automatiques sur le compte bancaire indiqué lors de la souscription.\n\n**Informations du mandat SEPA**\n• Référence Unique de Mandat (RUM) : {sepaMandateRef}\n• Type de paiement : Prélèvement récurrent\n• Fréquence : Mensuelle\n• Date de prélèvement : Entre le 1er et le 5 de chaque mois\n\nLe Client bénéficie d\'un droit au remboursement par sa banque selon les conditions décrites dans la convention passée avec elle. Une demande de remboursement doit être présentée dans les 8 semaines suivant la date de débit.',
    order: 5,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_6',
    title: 'ARTICLE 6 - CONDITIONS GÉNÉRALES DE VENTE',
    content: 'Le présent contrat est régi par les Conditions Générales de Vente (CGV) de LAIA Connect, accessibles en ligne à l\'adresse : https://www.laia-connect.fr/cgv-laia-connect\n\nLe Client déclare expressément :\n• Avoir pris connaissance de l\'intégralité des CGV avant la souscription\n• Les accepter sans réserve ni restriction\n• Avoir la capacité juridique pour contracter\n• Agir dans le cadre de son activité professionnelle\n\nLe Prestataire se réserve le droit de modifier ses CGV. Les modifications entreront en vigueur 30 jours après notification par email.',
    order: 6,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_7',
    title: 'ARTICLE 7 - PROPRIÉTÉ INTELLECTUELLE',
    content: '**7.1 Licence d\'utilisation**\nLe Prestataire concède au Client un droit d\'utilisation non exclusif, personnel et non cessible de la plateforme LAIA Connect pour la durée du contrat. Ce droit ne confère aucun droit de propriété sur le logiciel.\n\n**7.2 Propriété des données**\nLe Client reste propriétaire exclusif de toutes les données saisies ou générées via la plateforme. Le Prestataire s\'engage à ne jamais utiliser, revendre ou exploiter ces données à des fins commerciales.\n\n**7.3 Export des données**\nLe Client peut à tout moment exporter ses données au format CSV, Excel ou PDF depuis son espace client.',
    order: 7,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_8',
    title: 'ARTICLE 8 - PROTECTION DES DONNÉES (RGPD)',
    content: '**8.1 Rôles et responsabilités**\n• LAIA Connect agit en qualité de responsable de traitement pour les données du Client\n• LAIA Connect agit en qualité de sous-traitant pour les données des clients finaux de l\'institut\n• Le Client agit en qualité de responsable de traitement pour ses propres clients\n\n**8.2 Engagements RGPD**\nLe Prestataire s\'engage à :\n• Traiter les données uniquement pour les finalités convenues\n• Garantir la sécurité et la confidentialité des données\n• Ne pas transférer les données hors Union Européenne sans accord\n• Notifier toute violation de données dans les 72 heures\n• Supprimer les données à la fin du contrat ou sur demande\n\n**8.3 Hébergement**\nLes données sont hébergées en Union Européenne (France) chez des prestataires certifiés ISO 27001.',
    order: 8,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_9',
    title: 'ARTICLE 9 - DISPONIBILITÉ ET SUPPORT',
    content: '**9.1 Engagement de disponibilité**\nLe Prestataire s\'engage à maintenir une disponibilité du service de 99,5% (hors maintenance programmée).\n\n**9.2 Support technique**\nLe support est accessible :\n• Par email : support@laia-connect.fr (réponse sous 24h)\n• Par téléphone : du lundi au vendredi, 9h-18h\n• Chat en ligne : Depuis l\'espace client\n\n**9.3 Formation et documentation**\nAccès à la base de connaissances, tutoriels vidéo, webinaires mensuels et FAQ.',
    order: 9,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_10',
    title: 'ARTICLE 10 - LIMITATION DE RESPONSABILITÉ',
    content: '**10.1 Obligation de moyens**\nLe Prestataire est tenu à une obligation de moyens. Il s\'engage à mettre en œuvre tous les moyens nécessaires pour assurer le bon fonctionnement de la plateforme.\n\n**10.2 Limitations**\nLa responsabilité du Prestataire est limitée aux dommages directs et ne peut excéder le montant total des sommes versées par le Client au cours des 12 derniers mois.\n\nLe Prestataire ne peut être tenu responsable :\n• Des pertes de chiffre d\'affaires, de clientèle ou de données\n• Des dommages indirects ou immatériels\n• Des interruptions causées par des tiers\n\n**10.3 Sauvegarde**\nLe Prestataire effectue des sauvegardes quotidiennes. Le Client reste responsable de sauvegarder ses données critiques.',
    order: 10,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_11',
    title: 'ARTICLE 11 - FORCE MAJEURE',
    content: 'Les parties ne pourront être tenues pour responsables en cas de force majeure.\n\nSont considérés comme cas de force majeure : catastrophes naturelles, incendie, guerre, grève générale, défaillance majeure d\'Internet, cyberattaque de grande ampleur, pandémie.\n\nEn cas de force majeure, les obligations sont suspendues. Si la situation se prolonge au-delà de 30 jours, chaque partie pourra résilier le contrat sans indemnité.',
    order: 11,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_12',
    title: 'ARTICLE 12 - CONFIDENTIALITÉ',
    content: 'Les parties s\'engagent à garder strictement confidentielles toutes les informations échangées dans le cadre du présent contrat.\n\nSont confidentielles : informations techniques et fonctionnelles, données financières et commerciales, données clients.\n\nL\'obligation de confidentialité reste en vigueur pendant toute la durée du contrat et pendant 5 ans après sa résiliation.',
    order: 12,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_13',
    title: 'ARTICLE 13 - SOUS-TRAITANCE',
    content: 'Le Prestataire peut faire appel à des sous-traitants pour l\'exécution de certaines prestations :\n\n**Sous-traitants agréés**\n• Hébergement : OVH, AWS (Union Européenne)\n• Paiements : Stripe (certifié PCI DSS)\n• Emails : Resend, SendGrid (conformes RGPD)\n\nLe Prestataire reste responsable des actes de ses sous-traitants. Le Client sera informé de tout changement de sous-traitant.',
    order: 13,
    isDefault: true,
    isActive: true
  },
  {
    key: 'article_14',
    title: 'ARTICLE 14 - DROIT APPLICABLE ET JURIDICTION',
    content: '**14.1 Droit applicable**\nLe présent contrat est régi par le droit français.\n\n**14.2 Médiation**\nEn cas de litige, les parties s\'engagent à rechercher une solution amiable. Le Client peut recourir gratuitement à un médiateur de la consommation.\n\n**Médiateur compétent** : Association des Médiateurs Européens\nEmail : saisine@mediationconso-ame.com\n\n**14.3 Juridiction**\nÀ défaut de résolution amiable dans un délai de 60 jours, le litige sera porté devant les tribunaux compétents.',
    order: 14,
    isDefault: true,
    isActive: true
  }
]

export default function ContractTemplateEditorPage() {
  const router = useRouter()
  const [clauses, setClauses] = useState<ContractClause[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedClause, setExpandedClause] = useState<string | null>(null)

  useEffect(() => {
    fetchClauses()
  }, [])

  async function fetchClauses() {
    setLoading(true)
    try {
      const res = await fetch('/api/super-admin/contract-clauses')
      if (res.ok) {
        const data = await res.json()
        if (data.clauses.length === 0) {
          // Initialiser avec les clauses par défaut
          setClauses(DEFAULT_CLAUSES.map(c => ({ ...c, id: undefined })))
        } else {
          setClauses(data.clauses)
        }
      } else if (res.status === 401) {
        router.push('/login?redirect=/super-admin/billing/contracts/template')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/super-admin/contract-clauses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauses })
      })

      if (res.ok) {
        alert('✅ Contrat mis à jour avec succès')
        fetchClauses() // Recharger pour avoir les IDs
      } else {
        alert('❌ Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  function addClause() {
    const newOrder = Math.max(...clauses.map(c => c.order), 0) + 1
    const newKey = `custom_${Date.now()}`

    setClauses([
      ...clauses,
      {
        key: newKey,
        title: 'ARTICLE PERSONNALISÉ',
        content: 'Votre contenu ici...',
        order: newOrder,
        isDefault: false,
        isActive: true
      }
    ])
    setExpandedClause(newKey)
  }

  function deleteClause(key: string) {
    if (confirm('Supprimer cette clause ?')) {
      setClauses(clauses.filter(c => c.key !== key))
    }
  }

  function toggleActive(key: string) {
    setClauses(clauses.map(c =>
      c.key === key ? { ...c, isActive: !c.isActive } : c
    ))
  }

  function updateClause(key: string, field: keyof ContractClause, value: any) {
    setClauses(clauses.map(c =>
      c.key === key ? { ...c, [field]: value } : c
    ))
  }

  function moveClause(key: string, direction: 'up' | 'down') {
    const index = clauses.findIndex(c => c.key === key)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= clauses.length) return

    const newClauses = [...clauses]
    const [moved] = newClauses.splice(index, 1)
    newClauses.splice(newIndex, 0, moved)

    // Réassigner les ordres
    newClauses.forEach((c, i) => {
      c.order = i + 1
    })

    setClauses(newClauses)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/super-admin/billing/contracts"
          className="text-purple-600 hover:text-purple-700 mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Retour aux contrats
        </Link>

        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText size={32} className="text-purple-600" />
              Éditeur de Contrat Complet
            </h1>
            <p className="text-gray-600">
              Gérez tous les articles du contrat, ajoutez vos propres clauses personnalisées
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Sauvegarde...' : 'Enregistrer tout'}
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Variables disponibles :</strong> {'{plan}'}, {'{monthlyAmount}'}, {'{trialEndsAt}'}, {'{sepaMandateRef}'} - Elles seront automatiquement remplacées dans le PDF final.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={addClause}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={18} />
          Ajouter une clause personnalisée
        </button>
      </div>

      {/* Liste des clauses */}
      <div className="space-y-4">
        {clauses.sort((a, b) => a.order - b.order).map((clause, index) => (
          <div
            key={clause.key}
            className={`bg-white rounded-lg shadow border-2 ${
              clause.isActive ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            {/* Header de la clause */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveClause(clause.key, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveClause(clause.key, 'down')}
                    disabled={index === clauses.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                <GripVertical size={20} className="text-gray-400" />

                <div className="flex-1">
                  <input
                    type="text"
                    value={clause.title}
                    onChange={(e) => updateClause(clause.key, 'title', e.target.value)}
                    className="w-full font-semibold text-lg border-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                    placeholder="Titre de l'article..."
                  />
                  {!clause.isDefault && (
                    <span className="text-xs text-purple-600">Clause personnalisée</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(clause.key)}
                  className={`p-2 rounded ${
                    clause.isActive
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={clause.isActive ? 'Masquer du contrat' : 'Afficher dans le contrat'}
                >
                  {clause.isActive ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>

                <button
                  onClick={() => setExpandedClause(expandedClause === clause.key ? null : clause.key)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {expandedClause === clause.key ? 'Réduire' : 'Modifier'}
                </button>

                {!clause.isDefault && (
                  <button
                    onClick={() => deleteClause(clause.key)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Supprimer cette clause"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Contenu de la clause (expandable) */}
            {expandedClause === clause.key && (
              <div className="p-4 border-t bg-gray-50">
                <textarea
                  value={clause.content}
                  onChange={(e) => updateClause(clause.key, 'content', e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder="Contenu de l'article..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Utilisez les variables {'{plan}'}, {'{monthlyAmount}'}, {'{trialEndsAt}'}, {'{sepaMandateRef}'} pour des valeurs dynamiques
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between pt-6 border-t">
        <p className="text-sm text-gray-600">
          {clauses.filter(c => c.isActive).length} clauses actives sur {clauses.length} total
        </p>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Sauvegarde...' : 'Enregistrer tout'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4">
        <h3 className="font-semibold text-amber-900 mb-2">⚠️ Important</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Les clauses désactivées n'apparaîtront pas dans les contrats générés</li>
          <li>• Utilisez les flèches pour réorganiser l'ordre des clauses</li>
          <li>• Les clauses personnalisées peuvent être supprimées, pas les clauses par défaut</li>
          <li>• Consultez un avocat avant de modifier les clauses juridiques importantes</li>
        </ul>
      </div>
    </div>
  )
}
