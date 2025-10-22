'use client';

import { useState, useEffect } from 'react';

export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setPaymentSuccess(true);
      setSessionId(params.get('session_id'));
    }
  }, []);

  const handleTestPayment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/test-stripe-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50, // 0,50€
          currency: 'eur',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      if (data.url) {
        setSuccess('Redirection vers Stripe...');
        window.location.href = data.url;
      } else {
        setSuccess('Paiement créé avec succès !');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess) {
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

        <div style={{
          padding: '20px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>Configuration Stripe validée !</h3>
          <p><strong>Session ID :</strong> {sessionId}</p>
          <p><strong>Montant :</strong> 0,50€</p>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#004085' }}>Prochaines étapes :</h3>
          <ol style={{ color: '#004085', marginLeft: '20px', lineHeight: '1.8' }}>
            <li>Allez sur <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>dashboard.stripe.com</a></li>
            <li>Vérifiez que le paiement de 0,50€ est enregistré</li>
            <li>Remboursez immédiatement ce paiement test</li>
            <li>Vérifiez dans "Développeurs" → "Webhooks" que l'événement a été reçu</li>
          </ol>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          color: '#856404',
          marginBottom: '20px'
        }}>
          <strong>⚠️ N'oubliez pas :</strong>
          <p style={{ margin: '10px 0 0 0' }}>
            Remboursez ce paiement test pour éviter des frais inutiles.
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
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
            ← Faire un autre test
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>
        🧪 Test Stripe Production
      </h1>

      <div style={{
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        color: '#856404'
      }}>
        <strong>⚠️ ATTENTION MODE PRODUCTION</strong>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
          Ce test créera un paiement RÉEL de <strong>0,50€</strong>.
          <br />
          Vous pourrez le rembourser immédiatement après depuis le dashboard Stripe.
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px', color: '#555' }}>Ce test va vérifier :</h3>
        <ul style={{ color: '#666', lineHeight: '1.8' }}>
          <li>✅ Connexion à l'API Stripe Production</li>
          <li>✅ Clés de configuration (sk_live_ et pk_live_)</li>
          <li>✅ Création d'une session de paiement</li>
          <li>✅ Redirection vers le checkout Stripe</li>
          <li>✅ Réception du webhook (si configuré)</li>
        </ul>
      </div>

      <button
        onClick={handleTestPayment}
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          backgroundColor: loading ? '#ccc' : '#635BFF',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#5046E5';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#635BFF';
          }
        }}
      >
        {loading ? '⏳ Création en cours...' : '💳 Créer un paiement test (0,50€)'}
      </button>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          <strong>❌ Erreur :</strong>
          <p style={{ margin: '5px 0 0 0' }}>{error}</p>
        </div>
      )}

      {success && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724'
        }}>
          <strong>✅ Succès :</strong>
          <p style={{ margin: '5px 0 0 0' }}>{success}</p>
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#004085'
      }}>
        <strong>💡 Après le test :</strong>
        <ol style={{ margin: '10px 0 0 20px', lineHeight: '1.8' }}>
          <li>Allez sur <a href="https://dashboard.stripe.com/test/payments" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>dashboard.stripe.com</a></li>
          <li>Vérifiez que le paiement apparaît dans "Paiements"</li>
          <li>Cliquez sur le paiement et sélectionnez "Rembourser"</li>
          <li>Si webhook configuré, vérifiez dans "Développeurs" → "Webhooks"</li>
        </ol>
      </div>
    </div>
  );
}
