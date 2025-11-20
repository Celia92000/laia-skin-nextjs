"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyToken } from "@/lib/auth-client";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier l'authentification via les cookies HTTP-only
        const response = await fetch('/api/auth/verify', {
          credentials: 'include' // Inclure les cookies
        });

        if (!response.ok) {
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
          return;
        }

        const data = await response.json();

        if (requireAdmin) {
          const adminRoles = ['admin', 'ORG_ADMIN', 'SUPER_ADMIN', 'STAFF', 'RECEPTIONIST', 'LOCATION_MANAGER', 'ACCOUNTANT'];
          if (!adminRoles.includes(data.user?.role)) {
            router.push('/');
            return;
          }
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur de vérification:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0] mx-auto mb-4"></div>
          <p className="text-[#2c3e50]/60">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}