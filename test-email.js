// Test direct EmailJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEmail() {
  console.log('Test d\'envoi email via EmailJS...\n');
  
  const emailData = {
    service_id: 'default_service',
    template_id: 'template_myu4emv',
    user_id: 'QK6MriGN3B0UqkIoS',
    template_params: {
      to_email: 'celia.ivorra95@hotmail.fr',
      client_name: 'Célia',
      service_name: 'Test Email',
      appointment_date: new Date().toLocaleDateString('fr-FR'),
      appointment_time: '14:00',
      salon_name: 'LAIA SKIN Institut',
      salon_address: '23 rue de la Beauté, 75001 Paris',
      from_name: 'LAIA SKIN Institut',
      reply_to: 'contact@laiaskininstitut.fr'
    }
  };

  console.log('Configuration:');
  console.log('- Service ID:', emailData.service_id);
  console.log('- Template ID:', emailData.template_id);
  console.log('- User ID:', emailData.user_id);
  console.log('- Destinataire:', emailData.template_params.to_email);
  console.log('\nEnvoi en cours...\n');

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS !');
      console.log('Response:', responseText);
      console.log('\nVérifiez votre boîte mail:', emailData.template_params.to_email);
    } else {
      console.log('❌ ERREUR lors de l\'envoi');
      console.log('Status:', response.status);
      console.log('Response:', responseText);
      
      if (response.status === 401) {
        console.log('\n⚠️  Problème d\'authentification EmailJS');
        console.log('Vérifiez votre User ID dans EmailJS');
      } else if (response.status === 400) {
        console.log('\n⚠️  Paramètres manquants ou invalides');
        console.log('Vérifiez que le template existe et est actif');
      }
    }
  } catch (error) {
    console.log('❌ ERREUR:', error.message);
  }
}

testEmail();