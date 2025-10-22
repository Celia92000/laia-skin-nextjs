'use client';

import { useEffect, useState } from 'react';

export default function StripeSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer session_id depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session_id');
    setSessionId(id);

    if (id) {
      fetch(`/api/stripe/session?session_id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setSessionDetails(data);
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{
      maxWidth: '600px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginBottom: '20px', color: '#28a745' }}>
        ✅ Paiement réussi !
      </h1>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Chargement des détails...</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '20px'
        }}>
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {!loading && !error && sessionDetails && (
        <div style={{
          padding: '20px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>Détails du paiement</h3>
          <p><strong>Session ID :</strong> {sessionId}</p>
          <p><strong>Montant :</strong> {(sessionDetails.amount_total / 100).toFixed(2)}€</p>
          <p><strong>Statut :</strong> {sessionDetails.payment_status}</p>
        </div>
      )}

      <div style={{
        padding: '20px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, color: '#004085' }}>✅ Test réussi !</h3>
        <p style={{ color: '#004085', marginBottom: '15px' }}>
          Votre configuration Stripe Production fonctionne correctement.
        </p>
        <p style={{ color: '#004085', fontWeight: 'bold' }}>
          Prochaines étapes :
        </p>
        <ol style={{ color: '#004085', marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Allez sur <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>dashboard.stripe.com</a></li>
          <li>Vérifiez que le paiement de 0,50€ est bien enregistré</li>
          <li>Remboursez immédiatement le paiement test</li>
          <li>Vérifiez dans "Développeurs" → "Webhooks" que l'événement a été reçu</li>
          <li>Si tout est OK, votre Stripe est prêt pour la production ! 🎉</li>
        </ol>
      </div>

      <div style={{
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        color: '#856404'
      }}>
        <strong>⚠️ N'oubliez pas :</strong>
        <p style={{ margin: '10px 0 0 0' }}>
          Remboursez ce paiement test depuis votre dashboard Stripe pour éviter des frais inutiles.
        </p>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a
          href="/test-stripe"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          ← Retour au test
        </a>
      </div>
    </div>
  );
}
