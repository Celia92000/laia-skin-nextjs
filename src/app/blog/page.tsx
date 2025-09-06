import Link from "next/link";
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp, Award } from "lucide-react";

const articles = [
  {
    id: "hydrofacial-revolution",
    title: "L'HydroFacial : La Révolution du Nettoyage en Profondeur",
    excerpt: "Découvrez comment cette technologie médicale venue des États-Unis transforme les soins du visage grâce à son système breveté Vortex-Fusion®.",
    category: "Technologies Avancées",
    readTime: "5 min",
    date: "2025-01-15",
    image: "hydrofacial",
    featured: true
  },
  {
    id: "microneedling-science",
    title: "La Science du Microneedling : Stimuler le Collagène Naturellement",
    excerpt: "Comprendre comment les micro-perforations contrôlées déclenchent le processus de régénération cellulaire pour une peau visiblement rajeunie.",
    category: "Anti-âge",
    readTime: "7 min",
    date: "2025-01-10",
    image: "microneedling"
  },
  {
    id: "bb-glow-coree",
    title: "BB Glow : L'Innovation Coréenne pour un Teint Parfait",
    excerpt: "Entre mésothérapie et maquillage semi-permanent, découvrez cette technique révolutionnaire venue de Corée du Sud.",
    category: "Innovations",
    readTime: "6 min",
    date: "2025-01-05",
    image: "bbglow"
  },
  {
    id: "led-therapie-nasa",
    title: "La technique LED : De la NASA à Votre Peau",
    excerpt: "Comment la technique LED développée pour les astronautes est devenue l'un des traitements anti-âge les plus efficaces, que j'utilise dans mon protocole LED Thérapie.",
    category: "Technologies",
    readTime: "4 min",
    date: "2024-12-28",
    image: "led"
  },
  {
    id: "routine-soins-hiver",
    title: "Adapter Sa Routine de Soins en Hiver",
    excerpt: "Mes conseils pour protéger et hydrater votre peau pendant la saison froide.",
    category: "Conseils",
    readTime: "3 min",
    date: "2024-12-20",
    image: "winter"
  },
  {
    id: "tendances-2025",
    title: "Les Tendances Esthétiques 2025",
    excerpt: "Quelles sont les nouvelles techniques et technologies qui vont marquer l'année en médecine esthétique.",
    category: "Tendances",
    readTime: "5 min",
    date: "2024-12-15",
    image: "trends"
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full mb-6 shadow-xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2c3e50] mb-6 animate-fade-in-up">
              Blog & Expertise
            </h1>
            <p className="text-xl text-[#2c3e50]/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Découvrez les dernières innovations en esthétique et mes conseils d'experte pour sublimer votre peau
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#d4b5a0]/20 text-[#c9a084] mb-4 w-fit">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Article à la Une
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2c3e50] mb-4">
                  {articles[0].title}
                </h2>
                <p className="text-[#2c3e50]/70 mb-6 text-lg">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm text-[#2c3e50]/60 mb-6">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(articles[0].date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {articles[0].readTime} de lecture
                  </span>
                </div>
                <Link 
                  href={`/blog/${articles[0].id}`}
                  className="inline-flex items-center gap-2 text-[#d4b5a0] font-semibold hover:gap-4 transition-all"
                >
                  Lire l'article complet
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="h-64 md:h-full bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 flex items-center justify-center">
                <div className="text-center">
                  <Award className="w-24 h-24 text-[#c9a084] mx-auto mb-4" />
                  <p className="text-[#c9a084] font-medium">Technologies de pointe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-8">
            Tous mes articles
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map((article) => (
              <article 
                key={article.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <div className="h-48 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-[#c9a084] group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium text-[#d4b5a0] uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h3 className="text-xl font-serif font-semibold text-[#2c3e50] mt-2 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-[#2c3e50]/70 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-[#2c3e50]/60">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {article.readTime}
                    </span>
                    <span>
                      {new Date(article.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                  <Link 
                    href={`/blog/${article.id}`}
                    className="inline-flex items-center gap-2 text-[#d4b5a0] font-medium mt-4 hover:gap-3 transition-all"
                  >
                    Lire la suite
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Restez informé(e) des dernières innovations
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Recevez mes articles exclusifs sur les nouvelles techniques esthétiques et mes conseils beauté directement dans votre boîte mail.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-[#d4b5a0] rounded-full font-semibold hover:shadow-xl transition-all duration-300"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}