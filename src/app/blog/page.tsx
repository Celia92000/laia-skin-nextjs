import Link from "next/link";
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Blog() {
  // Récupérer les articles depuis la base de données
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' }
  });

  const featuredPosts = posts.filter(p => p.featured);
  const recentPosts = posts.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 text-center relative">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2c3e50] mb-6">
            Le Blog LAIA SKIN
          </h1>
          <p className="text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            Découvrez nos conseils d'experte, les dernières innovations en soins esthétiques et nos astuces beauté pour une peau rayonnante.
          </p>
          
          <div className="flex justify-center gap-8 mt-12">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#d4b5a0]" />
              <span className="text-[#2c3e50] font-medium">{posts.length} Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#d4b5a0]" />
              <span className="text-[#2c3e50] font-medium">Conseils d'experte</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-[#d4b5a0]" />
              <span className="text-[#2c3e50] font-medium">Technologies avancées</span>
            </div>
          </div>
        </div>
      </section>

      {/* Articles vedettes */}
      {featuredPosts.length > 0 && (
        <section className="py-16 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"></div>
          <div className="max-w-7xl mx-auto relative">
            <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-8 text-center">Articles Vedettes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((article) => (
                <Link 
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group cursor-pointer"
                >
                  <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                    {article.mainImage && (
                      <div className="h-48 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 relative overflow-hidden">
                        <img 
                          src={article.mainImage} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}
                    
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
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.publishedAt).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#d4b5a0] transform group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tous les articles */}
      <section className="py-16 px-4 bg-white/70">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-8 text-center">
            {featuredPosts.length > 0 ? 'Tous nos Articles' : 'Nos Articles'}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((article) => (
              <Link 
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group cursor-pointer"
              >
                <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  {article.mainImage && (
                    <div className="h-48 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 relative overflow-hidden">
                      <img 
                        src={article.mainImage} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  
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
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(article.publishedAt).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#d4b5a0] transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-[#d4b5a0]/30 mx-auto mb-4" />
              <p className="text-[#2c3e50]/60 text-lg">Aucun article pour le moment</p>
              <p className="text-[#2c3e50]/40 mt-2">Revenez bientôt pour découvrir nos conseils beauté !</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Envie de découvrir nos soins ?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Profitez de notre expertise et de nos technologies de pointe pour sublimer votre peau
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/prestations"
              className="bg-white text-[#d4b5a0] px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Découvrir nos soins
            </Link>
            <Link 
              href="/reservation"
              className="bg-white/20 backdrop-blur text-white border-2 border-white/40 px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}