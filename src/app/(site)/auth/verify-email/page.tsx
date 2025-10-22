'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de vérification manquant.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);

        // Redirection après 3 secondes
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Erreur lors de la vérification');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#d4b5a0] mx-auto"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Vérification en cours...
            </h2>
            <p className="mt-2 text-gray-600">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              ✅ Email vérifié !
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-4 text-sm text-gray-500">
              Redirection vers la page de connexion dans 3 secondes...
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-[#d4b5a0] to-[#c9a589] hover:from-[#c9a589] to-[#b89578] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4b5a0]"
            >
              Se connecter maintenant
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              ❌ Vérification échouée
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 space-y-3">
              <Link
                href="/auth/resend-verification"
                className="block w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-[#d4b5a0] to-[#c9a589] hover:from-[#c9a589] to-[#b89578] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4b5a0]"
              >
                Renvoyer un email de vérification
              </Link>
              <Link
                href="/login"
                className="block w-full py-3 px-6 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4b5a0]"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
