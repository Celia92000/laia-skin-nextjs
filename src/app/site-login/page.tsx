"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

// Force dynamic rendering for pages with search params
export const dynamic = 'force-dynamic'

function SiteLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/site-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push(redirect);
        router.refresh();
      } else {
        setError("Mot de passe incorrect");
      }
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d4b5a0]/10 rounded-full mb-4">
              <Lock className="w-8 h-8 text-[#d4b5a0]" />
            </div>
            <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">
              Accès protégé
            </h1>
            <p className="text-[#2c3e50]/60">
              Ce site est en cours de développement
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2c3e50] mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent transition-all"
                placeholder="Entrez le mot de passe"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4b5a0] hover:bg-[#c4a590] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Vérification..." : "Accéder au site"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SiteLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    }>
      <SiteLoginForm />
    </Suspense>
  );
}
