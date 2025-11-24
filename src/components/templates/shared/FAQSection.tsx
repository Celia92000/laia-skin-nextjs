'use client';

import { useState, useMemo } from 'react';
import { Plus, Minus, Search } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQSectionProps {
  title?: string;
  description?: string;
  faqs: FAQ[];
  primaryColor: string;
  allowMultipleOpen?: boolean;
}

export default function FAQSection({
  title = 'Questions Fréquentes',
  description = 'Tout ce que vous devez savoir sur nos services',
  faqs,
  primaryColor,
  allowMultipleOpen = false
}: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    faqs.forEach(faq => {
      if (faq.category) cats.add(faq.category);
    });
    return Array.from(cats).sort();
  }, [faqs]);

  const hasCategories = categories.length > 0;
  const hasSearch = faqs.length > 8;

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = [...faqs];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [faqs, selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);

      if (allowMultipleOpen) {
        // Allow multiple items to be open
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        // Only one item can be open at a time
        if (newSet.has(id)) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add(id);
        }
      }

      return newSet;
    });
  };

  const isOpen = (id: string) => openItems.has(id);

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: primaryColor }}
          >
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Search Bar (only if more than 8 FAQs) */}
        {hasSearch && (
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-current focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                style={{ borderColor: searchQuery ? primaryColor : undefined }}
              />
            </div>
          </div>
        )}

        {/* Category Tabs (optional) */}
        {hasCategories && (
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === null
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedCategory === null ? primaryColor : undefined
              }}
            >
              Tout
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? primaryColor : undefined
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Aucune question trouvée pour "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-6 py-2 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            filteredFAQs.map(faq => {
              const open = isOpen(faq.id);

              return (
                <div
                  key={faq.id}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md"
                  style={{
                    borderColor: open ? primaryColor : undefined
                  }}
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                    aria-expanded={open}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {faq.question}
                      </h3>
                      {faq.category && !selectedCategory && (
                        <span
                          className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {faq.category}
                        </span>
                      )}
                    </div>

                    {/* Animated Icon */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: open ? primaryColor : '#f3f4f6',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    >
                      {open ? (
                        <Minus className="w-5 h-5 text-white" />
                      ) : (
                        <Plus
                          className="w-5 h-5"
                          style={{ color: open ? '#ffffff' : primaryColor }}
                        />
                      )}
                    </div>
                  </button>

                  {/* Answer Content */}
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: open ? '500px' : '0px',
                      opacity: open ? 1 : 0
                    }}
                  >
                    <div className="px-6 pb-6 pt-2">
                      <div className="text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        {!hasSearch && faqs.length > 3 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Vous ne trouvez pas votre réponse ?{' '}
              <a
                href="#contact"
                className="font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                Contactez-nous
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
